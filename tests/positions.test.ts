import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import app from "@/app";
import { db } from "@/db";
import { depositEvents, loans, withdrawEvents } from "@/db/schema";

import { cleanDb, getAuthToken, TEST_ADDRESS, testAccount } from "./setup";

const CONDITION_ID =
  "0xcafe000000000000000000000000000000000000000000000000000000000000";

async function seedLoan(overrides: Partial<typeof loans.$inferInsert> = {}) {
  const [loan] = await db
    .insert(loans)
    .values({
      loanId: 1,
      borrower: TEST_ADDRESS,
      conditionId: CONDITION_ID,
      tokenId: "99999999999999999999",
      collateralAmount: "1000000000",
      principal: "400000000",
      premiumPaid: "12000000",
      interestDue: "5000000",
      interestRateBps: 700,
      liquidationPrice: "480000000000000000",
      epochStart: 1720000000,
      epochEnd: 1720086400,
      status: "active",
      txHash: "0xaaa",
      blockNumber: 50000000,
      ...overrides,
    })
    .returning();
  return loan;
}

let token: string;

beforeEach(async () => {
  await cleanDb();
  token = await getAuthToken(app, testAccount);
});

afterEach(async () => {
  await cleanDb();
});

function authed(path: string, init?: RequestInit) {
  const { headers, ...rest } = init ?? {};
  return app.request(path, {
    ...rest,
    headers: { Authorization: `Bearer ${token}`, ...headers },
  });
}

describe("GET /users/me/loans", () => {
  test("returns 401 without auth", async () => {
    const res = await app.request("/users/me/loans");
    expect(res.status).toBe(401);
  });

  test("returns empty array with no loans", async () => {
    const res = await authed("/users/me/loans");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test("returns loans for authenticated wallet", async () => {
    await seedLoan();
    const res = await authed("/users/me/loans");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any[];
    expect(body).toHaveLength(1);
    expect(body[0].loanId).toBe(1);
    expect(body[0].borrower).toBe(TEST_ADDRESS);
    expect(body[0].principal).toBe("400000000");
    expect(body[0].status).toBe("active");
  });

  test("does not return loans belonging to other wallets", async () => {
    await seedLoan({ borrower: "0xother" });
    const res = await authed("/users/me/loans");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any[];
    expect(body).toHaveLength(0);
  });

  test("filters by status", async () => {
    await seedLoan({ loanId: 1, status: "active" });
    await seedLoan({ loanId: 2, status: "repaid" });

    const activeRes = await authed("/users/me/loans?status=active");
    const activeBody = (await activeRes.json()) as any[];
    expect(activeBody).toHaveLength(1);
    expect(activeBody[0].loanId).toBe(1);

    const repaidRes = await authed("/users/me/loans?status=repaid");
    const repaidBody = (await repaidRes.json()) as any[];
    expect(repaidBody).toHaveLength(1);
    expect(repaidBody[0].loanId).toBe(2);
  });

  test("healthFactor is null for non-active loans", async () => {
    await seedLoan({ status: "repaid" });
    const res = await authed("/users/me/loans");
    const body = (await res.json()) as any[];
    expect(body[0].healthFactor).toBeNull();
  });
});

describe("GET /users/me/loans/:loanId", () => {
  test("returns loan detail", async () => {
    await seedLoan();
    const res = await authed("/users/me/loans/1");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.loanId).toBe(1);
    expect(body.conditionId).toBe(CONDITION_ID);
    expect(body.collateralAmount).toBe("1000000000");
  });

  test("returns 404 for loan owned by different wallet", async () => {
    await seedLoan({ borrower: "0xother" });
    const res = await authed("/users/me/loans/1");
    expect(res.status).toBe(404);
  });

  test("returns 404 for nonexistent loan", async () => {
    const res = await authed("/users/me/loans/999");
    expect(res.status).toBe(404);
  });

  test("returns 400 for non-numeric loanId", async () => {
    const res = await authed("/users/me/loans/abc");
    expect(res.status).toBe(400);
  });
});

describe("GET /users/me/history", () => {
  test("returns 401 without auth", async () => {
    const res = await app.request("/users/me/history");
    expect(res.status).toBe(401);
  });

  test("returns empty array with no events", async () => {
    const res = await authed("/users/me/history");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test("returns combined events sorted by block number descending", async () => {
    await db.insert(depositEvents).values({
      lender: TEST_ADDRESS,
      amount: "1000000",
      shares: "999000",
      txHash: "0xdep1",
      blockNumber: 50000001,
    });
    await db.insert(withdrawEvents).values({
      lender: TEST_ADDRESS,
      shares: "500000",
      amount: "510000",
      txHash: "0xwith1",
      blockNumber: 50000003,
    });
    await seedLoan({ blockNumber: 50000002 });

    const res = await authed("/users/me/history");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any[];
    expect(body).toHaveLength(3);
    expect(body[0].type).toBe("withdraw");
    expect(body[0].blockNumber).toBe(50000003);
    expect(body[1].type).toBe("loan");
    expect(body[1].blockNumber).toBe(50000002);
    expect(body[2].type).toBe("deposit");
    expect(body[2].blockNumber).toBe(50000001);
  });

  test("does not include events from other wallets", async () => {
    await db.insert(depositEvents).values({
      lender: "0xother",
      amount: "1000000",
      shares: "999000",
      txHash: "0xdep2",
      blockNumber: 50000001,
    });

    const res = await authed("/users/me/history");
    const body = (await res.json()) as any[];
    expect(body).toHaveLength(0);
  });
});
