import type { PublicClient } from "viem";

import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";

type ContractName =
  | "pool"
  | "core"
  | "views"
  | "oracle"
  | "controller"
  | "reserve"
  | "usdc"
  | "ctf";

const ENV_MAP: Record<ContractName, string> = {
  pool: "POOL_ADDRESS",
  core: "CORE_ADDRESS",
  views: "VIEWS_ADDRESS",
  oracle: "ORACLE_ADDRESS",
  controller: "CONTROLLER_ADDRESS",
  reserve: "RESERVE_ADDRESS",
  usdc: "USDC_ADDRESS",
  ctf: "CTF_ADDRESS",
};

let _client: PublicClient | null = null;

export function getPublicClient(): PublicClient {
  if (!_client) {
    if (!process.env.RPC_URL) {
      throw new Error("RPC_URL environment variable not set");
    }
    _client = createPublicClient({
      chain: polygon,
      transport: http(process.env.RPC_URL),
    });
  }
  return _client;
}

export function getContract(contractName: ContractName): `0x${string}` {
  const envVar = ENV_MAP[contractName];
  const val = process.env[envVar];
  if (!val) throw new Error(`${envVar} environment variable not set`);
  return val as `0x${string}`;
}
