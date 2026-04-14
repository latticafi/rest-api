import { cors } from "hono/cors";

import configureOpenAPI from "@/lib/configureOpenAPI";
import createApp from "@/lib/createApp";
import { authMiddleware } from "@/middleware/auth";
import authRouter from "@/routes/auth/auth.index";
import poolRouter from "@/routes/pool/pool.index";
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

app.route("/", authRouter);
app.route("/", poolRouter);
app.route("/", usersRouter);

configureOpenAPI(app);

export default app;
