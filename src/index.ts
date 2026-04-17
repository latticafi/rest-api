import app from "./app";
import { startPriceFeed } from "./lib/priceFeed";

const port = Number(process.env.PORT || 3000);
console.log(`Listening on http://localhost:${port}`);

startPriceFeed().catch((err) => {
  console.error("[PRICE-FEED] Failed to start:", err);
});

Bun.serve({
  port,
  fetch: app.fetch,
});
