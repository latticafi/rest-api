import { eq } from "drizzle-orm";

import { db } from "@/db";
import { markets } from "@/db/schema";

import {
  close,
  connect,
  sendSubscribe,
  setReconnectHandler,
} from "./connection";
import { clearAssets, registerAsset } from "./dispatch";

export { clearPrices, getAllPrices, getMidPrice } from "./store";
export type { PriceData } from "./store";

async function loadMarketAssets(): Promise<string[]> {
  const rows = await db
    .select({ conditionId: markets.conditionId, tokenId: markets.tokenId })
    .from(markets)
    .where(eq(markets.active, true));

  clearAssets();
  for (const row of rows) {
    registerAsset(row.tokenId, row.conditionId);
  }

  return rows.map((r) => r.tokenId);
}

async function boot() {
  const assetIds = await loadMarketAssets();
  connect(assetIds);
}

export async function startPriceFeed() {
  setReconnectHandler(boot);
  await boot();
}

export async function subscribeMarket(conditionId: string, tokenId: string) {
  registerAsset(tokenId, conditionId);
  sendSubscribe([tokenId]);
}

export function stopPriceFeed() {
  close();
}
