import type { Context, Next } from "hono";

import { verifyJWT } from "@/lib/jwt";

const PUBLIC_PATHS = ["/auth/", "/doc", "/health", "/markets"];
const PUBLIC_EXACT = ["/pool", "/pool/preview-liquidation"];

const ADMIN_WALLETS = new Set(
  (process.env.ADMIN_WALLETS || "")
    .split(",")
    .filter(Boolean)
    .map((a) => a.toLowerCase()),
);

export async function authMiddleware(c: Context, next: Next) {
  const path = c.req.path;

  if (
    PUBLIC_PATHS.some((p) => path.startsWith(p)) ||
    PUBLIC_EXACT.includes(path)
  ) {
    return next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json(
      { message: "Missing or malformed Authorization header" },
      401,
    );
  }

  try {
    const payload = await verifyJWT(authHeader.slice(7));
    c.set("walletAddress", payload.sub);
  } catch {
    return c.json({ message: "Invalid or expired token" }, 401);
  }

  await next();
}

export async function adminMiddleware(c: Context, next: Next) {
  const wallet = c.get("walletAddress");
  if (!wallet || !ADMIN_WALLETS.has(wallet)) {
    return c.json({ message: "Forbidden" }, 403);
  }
  await next();
}
