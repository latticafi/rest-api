import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import app from "@/app";
import { db } from "@/db";
import { markets } from "@/db/schema";

import { cleanDb } from "./setup";

const CONDITION_ID =
  "0xcafe000000000000000000000000000000000000000000000000000000000000";

async function seedMarket(
  overrides: Partial<typeof markets.$inferInsert> = {},
) {
  const [market] = await db
    .insert(markets)
    .values({
      conditionId: CONDITION_ID,
      tokenId: "99999999999999999999",
      minLtvBps: 3000,
      maxLtvBps: 8500,
      resolutionTime: 1720000000,
      originationCutoff: 1719900000,
      active: true,
      name: "Will ETH hit 10k?",
      category: "crypto",
      ...overrides,
    })
    .returning();
  return market;
}

beforeEach(async () => {
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

describe("GET /markets", () => {
  test("returns empty array when no markets", async () => {
    const res = await app.request("/markets");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual([]);
  });

  test("returns active markets without auth", async () => {
    await seedMarket();
    const res = await app.request("/markets");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any[];
    expect(body).toHaveLength(1);
    expect(body[0].conditionId).toBe(CONDITION_ID);
    expect(body[0].tokenId).toBe("99999999999999999999");
    expect(body[0].name).toBe("Will ETH hit 10k?");
  });

  test("excludes inactive markets", async () => {
    await seedMarket({ active: false });
    const res = await app.request("/markets");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any[];
    expect(body).toHaveLength(0);
  });
});

describe("GET /markets/:conditionId", () => {
  test("returns market detail without auth", async () => {
    await seedMarket();
    const res = await app.request(`/markets/${CONDITION_ID}`);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.conditionId).toBe(CONDITION_ID);
    expect(body.minLtvBps).toBe(3000);
    expect(body.maxLtvBps).toBe(8500);
    expect(body.active).toBe(true);
  });

  test("returns inactive market detail", async () => {
    await seedMarket({ active: false });
    const res = await app.request(`/markets/${CONDITION_ID}`);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.active).toBe(false);
  });

  test("returns 404 for unknown market", async () => {
    const unknown =
      "0x0000000000000000000000000000000000000000000000000000000000000001";
    const res = await app.request(`/markets/${unknown}`);
    expect(res.status).toBe(404);
  });

  test("returns 422 for invalid conditionId format", async () => {
    const res = await app.request("/markets/not-a-bytes32");
    expect(res.status).toBe(400);
  });
});
