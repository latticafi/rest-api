import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import app from "@/app";
import { db } from "@/db";
import { markets } from "@/db/schema";

import { cleanDb, getAuthToken, testAccount } from "./setup";

const CONDITION_ID =
  "0xcafe000000000000000000000000000000000000000000000000000000000000";

const VALID_QUOTE_BODY = {
  conditionId: CONDITION_ID,
  borrowAmount: 400_000_000,
  collateralAmount: 1_000_000_000,
  epochLength: 86400,
};

async function seedActiveMarket() {
  await db.insert(markets).values({
    conditionId: CONDITION_ID,
    tokenId: "99999999999999999999",
    minLtvBps: 3000,
    maxLtvBps: 8500,
    resolutionTime: 1720000000,
    originationCutoff: 1719900000,
    active: true,
  });
}

let token: string;

beforeEach(async () => {
  await cleanDb();
  token = await getAuthToken(app, testAccount);
});

afterEach(async () => {
  await cleanDb();
});

describe("POST /quotes", () => {
  test("returns 401 without auth", async () => {
    const res = await app.request("/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(VALID_QUOTE_BODY),
    });
    expect(res.status).toBe(401);
  });

  test("returns 422 for missing fields", async () => {
    const res = await app.request("/quotes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conditionId: CONDITION_ID }),
    });
    expect(res.status).toBe(422);
  });

  test("returns 422 for negative borrowAmount", async () => {
    const res = await app.request("/quotes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...VALID_QUOTE_BODY, borrowAmount: -100 }),
    });
    expect(res.status).toBe(422);
  });

  test("returns 404 for unknown market", async () => {
    const res = await app.request("/quotes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(VALID_QUOTE_BODY),
    });
    expect(res.status).toBe(404);
  });

  test("returns 404 for inactive market", async () => {
    await db.insert(markets).values({
      conditionId: CONDITION_ID,
      tokenId: "99999999999999999999",
      minLtvBps: 3000,
      maxLtvBps: 8500,
      resolutionTime: 1720000000,
      originationCutoff: 1719900000,
      active: false,
    });

    const res = await app.request("/quotes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(VALID_QUOTE_BODY),
    });
    expect(res.status).toBe(404);
  });

  test("returns 503 when price feed has no data for market", async () => {
    await seedActiveMarket();

    const res = await app.request("/quotes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(VALID_QUOTE_BODY),
    });
    expect(res.status).toBe(503);
  });
});
