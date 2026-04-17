const STALE_THRESHOLD_MS = 60_000;

export interface PriceData {
  bid: number;
  ask: number;
  mid: number;
  updatedAt: number;
}

const prices = new Map<string, PriceData>();

export function getMidPrice(conditionId: string): PriceData | null {
  const data = prices.get(conditionId);
  if (!data) return null;
  if (Date.now() - data.updatedAt > STALE_THRESHOLD_MS) return null;
  return data;
}

export function getAllPrices(): Map<string, PriceData> {
  return prices;
}

export function updatePrice(conditionId: string, bid: number, ask: number) {
  if (bid <= 0 || ask <= bid) return;
  prices.set(conditionId, {
    bid,
    ask,
    mid: (bid + ask) / 2,
    updatedAt: Date.now(),
  });
}
