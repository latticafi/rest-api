import type { Context, Next } from "hono";

import { privy } from "@/lib/privy";

export interface AuthVariables {
  privyDid: string;
  privyAppId: string;
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json(
      { message: "Missing or malformed Authorization header" },
      401,
    );
  }

  const token = authHeader.slice(7);

  try {
    const verifiedClaims = await privy.verifyAuthToken(token);
    c.set("privyDid", verifiedClaims.userId);
    c.set("privyAppId", verifiedClaims.appId);
  } catch (error) {
    console.error("Token verification failed", error);
    return c.json({ message: "Invalid or expired token" }, 401);
  }

  await next();
}
