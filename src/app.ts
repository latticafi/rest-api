import { cors } from "hono/cors";

import configureOpenAPI from "@/lib/configureOpenAPI";
import createApp from "@/lib/createApp";
import { adminMiddleware, authMiddleware } from "@/middleware/auth";
import adminRouter from "@/routes/admin/admin.index";
import authRouter from "@/routes/auth/auth.index";
import healthRouter from "@/routes/health";
import marketsRouter from "@/routes/markets/markets.index";
import poolRouter from "@/routes/pool/pool.index";
import pricesRouter from "@/routes/prices/prices.index";
import quotesRouter from "@/routes/quotes/quotes.index";
import usersRouter from "@/routes/users/users.index";

const app = createApp();

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use("*", authMiddleware);
app.use("/admin/*", adminMiddleware);

app.route("/", healthRouter);
app.route("/", authRouter);
app.route("/", adminRouter);
app.route("/", marketsRouter);
app.route("/", poolRouter);
app.route("/", pricesRouter);
app.route("/", quotesRouter);
app.route("/", usersRouter);

configureOpenAPI(app);

export default app;
