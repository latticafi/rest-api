import type { Context, Next } from "hono";

import { verifyJWT } from "@/lib/jwt";

const PUBLIC_PREFIXES = ["/auth", "/doc", "/health"];

export async function authMiddleware(c: Context, next: Next) {
  if (PUBLIC_PREFIXES.some((p) => c.req.path.startsWith(p))) {
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
