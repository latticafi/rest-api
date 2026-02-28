import { PrivyClient } from "@privy-io/node";

const appId = process.env.PRIVY_APP_ID;
const appSecret = process.env.PRIVY_APP_SECRET;
const jwtVerificationKey = process.env.PRIVY_VERIFICATION_KEY;

if (!appId || !appSecret) {
  throw new Error("Privy environment variables not set");
}

export const privy = new PrivyClient({ appId, appSecret, jwtVerificationKey });
