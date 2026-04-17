import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import app from "@/app";

import { cleanDb, getAuthToken, testAccount } from "./setup";

const POOL = process.env.POOL_ADDRESS!;
const USDC = process.env.USDC_ADDRESS!;
const CTF = process.env.CTF_ADDRESS!;

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

describe("POST /pool/deposit/prepare", () => {
  test("returns 401 without auth", async () => {
    const res = await app.request("/pool/deposit/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: "1000000" }),
    });
    expect(res.status).toBe(401);
  });

  test("returns encoded calldata", async () => {
    const res = await authed("/pool/deposit/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: "1000000" }),
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as { to: string; data: string };
    expect(body.to).toBe(POOL);
    expect(body.data).toMatch(/^0x/);
  });

  test("rejects non-numeric amount", async () => {
    const res = await authed("/pool/deposit/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: "abc" }),
    });
    expect(res.status).toBe(422);
  });
});

describe("POST /pool/withdraw/prepare", () => {
  test("returns encoded calldata", async () => {
    const res = await authed("/pool/withdraw/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shares: "999000" }),
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as { to: string; data: string };
    expect(body.to).toBe(POOL);
    expect(body.data).toMatch(/^0x/);
  });
});

describe("POST /loans/repay/prepare", () => {
  test("returns encoded calldata", async () => {
    const res = await authed("/loans/repay/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanId: "1" }),
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as { to: string; data: string };
    expect(body.to).toBe(POOL);
    expect(body.data).toMatch(/^0x/);
  });
});

describe("POST /approvals/prepare", () => {
  test("returns USDC approve calldata targeting USDC contract", async () => {
    const res = await authed("/approvals/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "usdc" }),
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as { to: string; data: string };
    expect(body.to).toBe(USDC);
  });

  test("returns CTF setApprovalForAll calldata targeting CTF contract", async () => {
    const res = await authed("/approvals/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "ctf" }),
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as { to: string; data: string };
    expect(body.to).toBe(CTF);
  });

  test("rejects invalid token type", async () => {
    const res = await authed("/approvals/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "eth" }),
    });
    expect(res.status).toBe(422);
  });
});

describe("POST /loans/borrow/prepare", () => {
  test("returns 401 without auth", async () => {
    const res = await app.request("/loans/borrow/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });

  test("returns encoded calldata with all params", async () => {
    const res = await authed("/loans/borrow/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conditionId:
          "0xcafe000000000000000000000000000000000000000000000000000000000000",
        collateralAmount: "1000000000",
        borrowAmount: "400000000",
        epochLength: "86400",
        premiumBps: 300,
        deadline: 1720000000,
        nonce: 0,
        signature: "0xdead",
        price: "600000000000000000",
        priceTimestamp: 1719999900,
        priceDeadline: 1720000100,
        priceSignature: "0xbeef",
      }),
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as { to: string; data: string };
    expect(body.to).toBe(POOL);
    expect(body.data).toMatch(/^0x/);
    expect(body.data.length).toBeGreaterThan(10);
  });
});
