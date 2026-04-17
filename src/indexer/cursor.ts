import { eq } from "drizzle-orm";

import { db } from "@/db";
import { indexerCursor } from "@/db/schema";
import { getPublicClient } from "@/lib/chain";

export async function getCursor(): Promise<bigint> {
  const [row] = await db
    .select()
    .from(indexerCursor)
    .where(eq(indexerCursor.id, 1));
  if (row) return BigInt(row.lastBlock);

  const client = getPublicClient();
  const head = await client.getBlockNumber();
  await db.insert(indexerCursor).values({ id: 1, lastBlock: Number(head) });
  return head;
}

export async function setCursor(block: bigint) {
  await db
    .update(indexerCursor)
    .set({ lastBlock: Number(block) })
    .where(eq(indexerCursor.id, 1));
}
