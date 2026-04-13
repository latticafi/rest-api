import { eq } from "drizzle-orm";
import { verifyMessage } from "viem";
import { parseSiweMessage } from "viem/siwe";

import type { AppRouteHandler } from "@/lib/types";
import type { NonceRoute, VerifyRoute } from "@/routes/auth/auth.routes";

import { db } from "@/db";
import { users } from "@/db/schema";
import { signJWT } from "@/lib/jwt";
import { consumeNonce, generateNonce } from "@/lib/nonces";

const SIWE_DOMAIN = process.env.SIWE_DOMAIN || "localhost";

export const nonce: AppRouteHandler<NonceRoute> = async (c) => {
  return c.json({ nonce: generateNonce() }, 200);
};

export const verify: AppRouteHandler<VerifyRoute> = async (c) => {
  const { message, signature } = c.req.valid("json");

  let parsed: ReturnType<typeof parseSiweMessage>;
  try {
    parsed = parseSiweMessage(message);
  } catch {
    return c.json({ message: "Malformed SIWE message" }, 401);
  }

  if (parsed.domain !== SIWE_DOMAIN) {
    return c.json({ message: "Domain mismatch" }, 401);
  }

  if (!parsed.nonce || !consumeNonce(parsed.nonce)) {
    return c.json({ message: "Invalid or expired nonce" }, 401);
  }

  if (!parsed.address) {
    return c.json({ message: "Missing address in SIWE message" }, 401);
  }

  try {
    const valid = await verifyMessage({
      address: parsed.address,
      message,
      signature: signature as `0x${string}`,
    });
    if (!valid) {
      return c.json({ message: "Invalid signature" }, 401);
    }
  } catch {
    return c.json({ message: "Signature verification failed" }, 401);
  }

  const walletAddress = parsed.address.toLowerCase();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, walletAddress));

  if (existing.length === 0) {
    await db.insert(users).values({ walletAddress });
  }

  const token = await signJWT(walletAddress);
  return c.json({ token, walletAddress }, 200);
};
