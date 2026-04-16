import type { Chain, Transport, WalletClient } from "viem";
import type { PrivateKeyAccount } from "viem/accounts";

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";

let _client: WalletClient<Transport, Chain, PrivateKeyAccount> | null = null;

export function getOperatorClient(): WalletClient<
  Transport,
  Chain,
  PrivateKeyAccount
> {
  if (!_client) {
    if (!process.env.OPERATOR_PRIVATE_KEY) {
      throw new Error("OPERATOR_PRIVATE_KEY environment variable not set");
    }
    if (!process.env.RPC_URL) {
      throw new Error("RPC_URL environment variable not set");
    }
    const account = privateKeyToAccount(
      process.env.OPERATOR_PRIVATE_KEY as `0x${string}`,
    );
    _client = createWalletClient({
      account,
      chain: polygon,
      transport: http(process.env.RPC_URL),
    });
  }
  return _client;
}
