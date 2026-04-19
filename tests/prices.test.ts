import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import app from "@/app";
import { clearPrices } from "@/pricefeed";

import { cleanDb } from "./setup";

const VALID_CID =
  "0xcafe000000000000000000000000000000000000000000000000000000000000";

beforeEach(async () => {
  clearPrices();
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

describe("GET /prices/:conditionId", () => {
  test("returns 404 when no price data available", async () => {
    const res = await app.request(`/prices/${VALID_CID}`);
    expect(res.status).toBe(404);
  });

  test("accessible without auth", async () => {
    const res = await app.request(`/prices/${VALID_CID}`);
    expect([200, 404]).toContain(res.status);
  });

  test("returns 400 for invalid conditionId", async () => {
    const res = await app.request("/prices/not-bytes32");
    expect(res.status).toBe(400);
  });
});
