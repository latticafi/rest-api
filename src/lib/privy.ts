import { PrivyClient } from "@privy-io/server-auth";

const appId = process.env.PRIVY_APP_ID;
const appSecret = process.env.PRIVY_APP_SECRET;

if (!appId || !appSecret) {
  throw new Error("Privy environment variables not set");
}

export const privy = new PrivyClient(appId, appSecret);
