import { updatePrice } from "./store";

const assetToCondition = new Map<string, string>();

export function registerAsset(assetId: string, conditionId: string) {
  assetToCondition.set(assetId, conditionId);
}

export function clearAssets() {
  assetToCondition.clear();
}

export function dispatch(raw: string) {
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
