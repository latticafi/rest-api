import type { AppRouteHandler } from "@/lib/types";
import type {
  LenderBalanceRoute,
  PreviewLiquidationRoute,
  SnapshotRoute,
} from "@/routes/pool/pool.routes";

import { viewsAbi } from "@/lib/abis";
import { getContract, getPublicClient } from "@/lib/chain";

export const snapshot: AppRouteHandler<SnapshotRoute> = async (c) => {
  const client = getPublicClient();

  const data = await client.readContract({
    address: getContract("views"),
    abi: viewsAbi,
    functionName: "get_pool_snapshot",
  });

  return c.json(
    {
      totalAssets: data.total_assets.toString(),
      totalBorrowed: data.total_borrowed.toString(),
      availableLiquidity: data.available_liquidity.toString(),
      utilization: Number(data.utilization),
      sharePrice: data.share_price.toString(),
      currentRate: Number(data.current_rate),
      maintenanceMargin: Number(data.maintenance_margin),
      reserveBalance: data.reserve_balance.toString(),
      reserveHealthy: data.reserve_healthy,
      circuitBroken: data.controller_circuit_broken,
      paused: data.paused,
      totalLoans: Number(data.total_loans),
    },
    200,
  );
};

export const previewLiquidation: AppRouteHandler<
  PreviewLiquidationRoute
> = async (c) => {
  const { collateral, borrow } = c.req.valid("query");
  const client = getPublicClient();

  const price = await client.readContract({
    address: getContract("views"),
    abi: viewsAbi,
    functionName: "preview_liquidation_price",
    args: [BigInt(collateral), BigInt(borrow)],
  });

  return c.json({ liquidationPrice: price.toString() }, 200);
};

export const lenderBalance: AppRouteHandler<LenderBalanceRoute> = async (c) => {
  const walletAddress = c.get("walletAddress") as `0x${string}`;
  const client = getPublicClient();

  const [shares, value] = await client.readContract({
    address: getContract("views"),
    abi: viewsAbi,
    functionName: "get_lender_balance",
    args: [walletAddress],
  });

  return c.json(
    {
      shares: shares.toString(),
      value: value.toString(),
    },
    200,
  );
};
