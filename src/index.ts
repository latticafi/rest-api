import app from "./app";
import { startIndexer } from "./indexer";
import { startPriceFeed } from "./pricefeed";

const port = Number(process.env.PORT || 3000);
console.log(`Listening on http://localhost:${port}`);

startPriceFeed().catch((err) => {
  console.error("[pricefeed] Failed to start:", err);
});

startIndexer();

Bun.serve({
  port,
  fetch: app.fetch,
});
