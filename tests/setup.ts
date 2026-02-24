import { spyOn } from "bun:test";
import * as jose from "jose";

import { db } from "@/db";
import { users } from "@/db/schema";

spyOn(console, "error").mockImplementation(() => {});

const { publicKey, privateKey } = await jose.generateKeyPair("ES256");
const publicKeyPem = await jose.exportSPKI(publicKey);

process.env.PRIVY_VERIFICATION_KEY = publicKeyPem;

export async function createTestToken(overrides?: {
  subject?: string;
  sessionId: string;
}) {
  return new jose.SignJWT({ sid: overrides?.sessionId ?? "test-session" })
    .setProtectedHeader({ alg: "ES256", typ: "JWT" })
    .setIssuer("privy.io")
    .setIssuedAt()
    .setAudience(process.env.PRIVY_APP_ID!)
    .setSubject(overrides?.subject ?? "did:privy:test-user-123")
    .setExpirationTime("1h")
    .sign(privateKey);
}

export async function createExpiredToken() {
  const now = Math.floor(Date.now() / 1000);
  return new jose.SignJWT({ sid: "expired-session" })
    .setProtectedHeader({ alg: "ES256", typ: "JWT" })
    .setIssuer("privy.io")
    .setIssuedAt(now - 7200)
    .setAudience(process.env.PRIVY_APP_ID!)
    .setSubject("did:privy:expired-user")
    .setExpirationTime(now - 3600)
    .sign(privateKey);
}

export async function cleanDb() {
  await db.delete(users);
}
