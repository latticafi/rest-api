import { afterEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { indexerCursor } from "@/db/schema";
import { getCursor, setCursor } from "@/indexer/cursor";

async function cleanCursor() {
  await db.delete(indexerCursor);
}

afterEach(async () => {
  await cleanCursor();
});

describe("indexer cursor", () => {
  test("getCursor seeds from chain head on first call", async () => {
    process.env.RPC_URL = process.env.RPC_URL || "https://polygon-rpc.com";
    const cursor = await getCursor();
    expect(cursor).toBeGreaterThan(0n);

    const [row] = await db
      .select()
      .from(indexerCursor)
      .where(eq(indexerCursor.id, 1));
    expect(row).toBeDefined();
    expect(BigInt(row.lastBlock)).toBe(cursor);
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
