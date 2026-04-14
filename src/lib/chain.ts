import type { PublicClient } from "viem";

import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";

let _client: PublicClient | null = null;

export function getPublicClient(): PublicClient {
  if (!_client) {
    if (!process.env.POLYGON_RPC_URL) {
      throw new Error("POLYGON_RPC_URL environment variable not set");
    }
    _client = createPublicClient({
      chain: polygon,
      transport: http(process.env.POLYGON_RPC_URL),
    });
  }
  return _client;
}

function requireAddress(name: string): `0x${string}` {
  const val = process.env[name];
  if (!val) throw new Error(`${name} environment variable not set`);
  return val as `0x${string}`;
}

export function getContract(
  name: "pool" | "core" | "views" | "oracle" | "controller" | "reserve",
): `0x${string}` {
  const envMap = {
    pool: "POOL_ADDRESS",
    core: "CORE_ADDRESS",
    views: "VIEWS_ADDRESS",
    oracle: "ORACLE_ADDRESS",
    controller: "CONTROLLER_ADDRESS",
    reserve: "RESERVE_ADDRESS",
  } as const;
  return requireAddress(envMap[name]);
}
