import { executeLiquidation } from "./executor";
import { scanActiveLoans } from "./scanner";

const SCAN_INTERVAL_MS = 30_000;

let running = false;

async function tick() {
  try {
    const atRisk = await scanActiveLoans();
    if (atRisk.length === 0) return;

    console.log(`[liquidator] Found ${atRisk.length} at-risk loans`);

    for (const loan of atRisk) {
      await executeLiquidation(loan);
    }
  } catch (err) {
    console.error("[liquidator] Scan error:", err);
  }
}

export function startLiquidator() {
  if (running) return;
  running = true;
  console.log("[liquidator] Starting (scan every 30s)");
  tick();
  setInterval(tick, SCAN_INTERVAL_MS);
}

export function stopLiquidator() {
  running = false;
}
