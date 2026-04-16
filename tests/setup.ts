import { spyOn } from "bun:test";
import { privateKeyToAccount } from "viem/accounts";
import { createSiweMessage } from "viem/siwe";

import { db } from "@/db";
import { markets, users } from "@/db/schema";

spyOn(console, "error").mockImplementation(() => {});

process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-at-least-32-chars-long!!";
process.env.SIWE_DOMAIN = "localhost";

export const TEST_PK =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
export const testAccount = privateKeyToAccount(TEST_PK);
export const TEST_ADDRESS = testAccount.address.toLowerCase();

export const NON_ADMIN_PK =
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
export const nonAdminAccount = privateKeyToAccount(NON_ADMIN_PK);
export const NON_ADMIN_ADDRESS = nonAdminAccount.address.toLowerCase();

process.env.ADMIN_WALLETS = TEST_ADDRESS;

export async function createSiwePayload(nonce: string, account = testAccount) {
  const message = createSiweMessage({
    address: account.address,
    chainId: 137,
    domain: "localhost",
    nonce,
    uri: "http://localhost:3000",
    version: "1",
  });

  const signature = await account.signMessage({ message });
  return { message, signature };
}

export async function getAuthToken(
  app: any,
  account = testAccount,
): Promise<string> {
  const nonceRes = await app.request("/auth/nonce");
  const { nonce } = (await nonceRes.json()) as { nonce: string };
  const { message, signature } = await createSiwePayload(nonce, account);

  const verifyRes = await app.request("/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });

  const { token } = (await verifyRes.json()) as { token: string };
  return token;
}

export async function cleanDb() {
  await db.delete(markets);
  await db.delete(users);
}
