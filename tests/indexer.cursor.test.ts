import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { indexerCursor } from "@/db/schema";

const MOCK_HEAD = 60000000n;

mock.module("@/lib/chain", () => ({
  getPublicClient: () => ({
    getBlockNumber: async () => MOCK_HEAD,
  }),
  getContract: (name: string) =>
    process.env[
      {
        pool: "POOL_ADDRESS",
        core: "CORE_ADDRESS",
        views: "VIEWS_ADDRESS",
        oracle: "ORACLE_ADDRESS",
        controller: "CONTROLLER_ADDRESS",
        reserve: "RESERVE_ADDRESS",
        usdc: "USDC_ADDRESS",
        ctf: "CTF_ADDRESS",
      }[name] ?? ""
    ] || "0x0000000000000000000000000000000000000001",
}));

const { getCursor, setCursor } = await import("@/indexer/cursor");

async function cleanCursor() {
  await db.delete(indexerCursor);
}

beforeEach(async () => {
  await cleanCursor();
});

afterEach(async () => {
  await cleanCursor();
});

describe("indexer cursor", () => {
  test("getCursor seeds from chain head on first call", async () => {
    const cursor = await getCursor();
    expect(cursor).toBe(MOCK_HEAD);

    const [row] = await db
      .select()
      .from(indexerCursor)
      .where(eq(indexerCursor.id, 1));
    expect(row).toBeDefined();
    expect(BigInt(row.lastBlock)).toBe(MOCK_HEAD);
  });

  test("getCursor returns existing cursor", async () => {
    await db.insert(indexerCursor).values({ id: 1, lastBlock: 50000000 });
    const cursor = await getCursor();
    expect(cursor).toBe(50000000n);
  });

  test("setCursor updates the stored block", async () => {
    await db.insert(indexerCursor).values({ id: 1, lastBlock: 100 });
    await setCursor(200n);

    const [row] = await db
      .select()
      .from(indexerCursor)
      .where(eq(indexerCursor.id, 1));
    expect(row.lastBlock).toBe(200);
  });
});
