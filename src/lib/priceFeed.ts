import { eq } from "drizzle-orm";

import { db } from "@/db";
import { markets } from "@/db/schema";

const CLOB_WSS_URL =
  process.env.CLOB_WSS_URL ||
  "wss://ws-subscriptions-clob.polymarket.com/ws/market";
const HEARTBEAT_MS = 10_000;
const RECONNECT_MS = 5_000;
const STALE_THRESHOLD_MS = 60_000;

export interface PriceData {
  bid: number;
  ask: number;
  mid: number;
  updatedAt: number;
}

const prices = new Map<string, PriceData>();
const assetToCondition = new Map<string, string>();

let ws: WebSocket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let running = false;

export function getMidPrice(conditionId: string): PriceData | null {
  const data = prices.get(conditionId);
  if (!data) return null;
  if (Date.now() - data.updatedAt > STALE_THRESHOLD_MS) return null;
  return data;
}

export function getAllPrices(): Map<string, PriceData> {
  return prices;
}

function updatePrice(conditionId: string, bid: number, ask: number) {
  if (bid <= 0 || ask <= bid) return;
  prices.set(conditionId, {
    bid,
    ask,
    mid: (bid + ask) / 2,
    updatedAt: Date.now(),
  });
}

function handleBook(msg: Record<string, unknown>) {
  const assetId = String(msg.asset_id || "");
  const conditionId = assetToCondition.get(assetId);
  if (!conditionId) return;

  const bids = msg.bids as Array<{ price: string; size: string }> | undefined;
  const asks = msg.asks as Array<{ price: string; size: string }> | undefined;

  if (!bids?.length || !asks?.length) return;

  const bestBid = Math.max(...bids.map((l) => Number(l.price)));
  const bestAsk = Math.min(...asks.map((l) => Number(l.price)));
  updatePrice(conditionId, bestBid, bestAsk);
}

function handlePriceChange(msg: Record<string, unknown>) {
  const changes = msg.price_changes as
    | Array<Record<string, unknown>>
    | undefined;
  if (!Array.isArray(changes)) return;

  for (const change of changes) {
    const assetId = String(change.asset_id || "");
    const conditionId = assetToCondition.get(assetId);
    if (!conditionId) continue;

    const bestBid = change.best_bid != null ? Number(change.best_bid) : null;
    const bestAsk = change.best_ask != null ? Number(change.best_ask) : null;
    if (bestBid == null || bestAsk == null) continue;

    updatePrice(conditionId, bestBid, bestAsk);
  }
}

function handleBestBidAsk(msg: Record<string, unknown>) {
  const assetId = String(msg.asset_id || "");
  const conditionId = assetToCondition.get(assetId);
  if (!conditionId) return;

  const bestBid = Number(msg.best_bid || 0);
  const bestAsk = Number(msg.best_ask || 0);
  if (bestBid > 0 && bestAsk > 0) {
    updatePrice(conditionId, bestBid, bestAsk);
  }
}

function dispatch(raw: string) {
  if (raw === "PONG") return;

  let msg: Record<string, unknown>;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }

  const eventType = String(msg.event_type || "");
  if (eventType === "book") handleBook(msg);
  else if (eventType === "price_change") handlePriceChange(msg);
  else if (eventType === "best_bid_ask") handleBestBidAsk(msg);
}

async function loadMarketAssets(): Promise<string[]> {
  const rows = await db
    .select({ conditionId: markets.conditionId, tokenId: markets.tokenId })
    .from(markets)
    .where(eq(markets.active, true));

  assetToCondition.clear();
  for (const row of rows) {
    assetToCondition.set(row.tokenId, row.conditionId);
  }

  return rows.map((r) => r.tokenId);
}

function connect(assetIds: string[]) {
  if (assetIds.length === 0) {
    console.log("[PRICE-FEED] No active markets, skipping connection");
    scheduleReconnect();
    return;
  }

  console.log(
    `[PRICE-FEED] Connecting to ${CLOB_WSS_URL} with ${assetIds.length} assets`,
  );
  ws = new WebSocket(CLOB_WSS_URL);

  ws.addEventListener("open", () => {
    console.log("[PRICE-FEED] Connected");
    ws!.send(JSON.stringify({ assets_ids: assetIds, type: "market" }));
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) ws.send("PING");
    }, HEARTBEAT_MS);
  });

  ws.addEventListener("message", (event) => {
    dispatch(String(event.data));
  });

  ws.addEventListener("close", () => {
    console.log("[PRICE-FEED] Disconnected");
    cleanup();
    scheduleReconnect();
  });

  ws.addEventListener("error", (event) => {
    console.error("[PRICE-FEED] Error:", event);
    cleanup();
    scheduleReconnect();
  });
}

function cleanup() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  ws = null;
}

function scheduleReconnect() {
  if (!running) return;
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await startPriceFeed();
  }, RECONNECT_MS);
}

export async function startPriceFeed() {
  running = true;
  const assetIds = await loadMarketAssets();
  connect(assetIds);
}

export async function subscribeMarket(conditionId: string, tokenId: string) {
  assetToCondition.set(tokenId, conditionId);
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ assets_ids: [tokenId], type: "market" }));
  }
}

export function stopPriceFeed() {
  running = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    cleanup();
  }
}
