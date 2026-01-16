import app from "./app";

const port = Number(process.env.PORT || 3000);
console.log(`Listening on http://localhost:${port}`);

Bun.serve({
  port,
  fetch: app.fetch,
});
