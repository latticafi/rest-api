import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";
import type {
  OnboardMarketRoute,
  PauseMarketRoute,
  PausePoolRoute,
  UnpausePoolRoute,
  UpdateMarketRoute,
} from "@/routes/admin/admin.routes";

import { db } from "@/db";
import { markets } from "@/db/schema";
import { lendingPoolAbi, poolCoreAbi } from "@/lib/abis";
import { getContract, getPublicClient } from "@/lib/chain";
import { getOperatorClient } from "@/lib/operator";

export const onboardMarket: AppRouteHandler<OnboardMarketRoute> = async (c) => {
  const body = c.req.valid("json");

  const existing = await db
    .select()
    .from(markets)
    .where(eq(markets.conditionId, body.conditionId));

  if (existing.length > 0) {
    return c.json({ message: "Market already exists" }, 409);
  }

  const operator = getOperatorClient();
  const client = getPublicClient();

  const hash = await operator.writeContract({
    address: getContract("core"),
    abi: poolCoreAbi,
    functionName: "set_market",
    args: [
      body.conditionId as `0x${string}`,
      {
        token_id: BigInt(body.tokenId),
        min_ltv_bps: BigInt(body.minLtvBps),
        max_ltv_bps: BigInt(body.maxLtvBps),
        resolution_time: BigInt(body.resolutionTime),
        origination_cutoff: BigInt(body.originationCutoff),
        active: true,
      },
    ],
  });

  await client.waitForTransactionReceipt({ hash });

  const [market] = await db
    .insert(markets)
    .values({
      conditionId: body.conditionId,
      tokenId: BigInt(body.tokenId),
      minLtvBps: body.minLtvBps,
      maxLtvBps: body.maxLtvBps,
      resolutionTime: BigInt(body.resolutionTime),
      originationCutoff: BigInt(body.originationCutoff),
      active: true,
    })
    .returning();

  return c.json(
    {
      conditionId: market.conditionId,
      tokenId: market.tokenId.toString(),
      minLtvBps: market.minLtvBps,
      maxLtvBps: market.maxLtvBps,
      resolutionTime: market.resolutionTime.toString(),
      originationCutoff: market.originationCutoff.toString(),
      active: market.active,
      name: market.name,
      description: market.description,
      imageUrl: market.imageUrl,
      category: market.category,
      txHash: hash,
    },
    201,
  );
};

export const updateMarket: AppRouteHandler<UpdateMarketRoute> = async (c) => {
  const { conditionId } = c.req.valid("param");
  const body = c.req.valid("json");

  const [existing] = await db
    .select()
    .from(markets)
    .where(eq(markets.conditionId, conditionId));

  if (!existing) {
    return c.json({ message: "Market not found" }, 404);
  }

  const updated = {
    minLtvBps: body.minLtvBps ?? existing.minLtvBps,
    maxLtvBps: body.maxLtvBps ?? existing.maxLtvBps,
    resolutionTime:
      body.resolutionTime != null
        ? BigInt(body.resolutionTime)
        : existing.resolutionTime,
    originationCutoff:
      body.originationCutoff != null
        ? BigInt(body.originationCutoff)
        : existing.originationCutoff,
  };

  const operator = getOperatorClient();
  const client = getPublicClient();

  const hash = await operator.writeContract({
    address: getContract("core"),
    abi: poolCoreAbi,
    functionName: "set_market",
    args: [
      conditionId as `0x${string}`,
      {
        token_id: existing.tokenId,
        min_ltv_bps: BigInt(updated.minLtvBps),
        max_ltv_bps: BigInt(updated.maxLtvBps),
        resolution_time: updated.resolutionTime,
        origination_cutoff: updated.originationCutoff,
        active: existing.active,
      },
    ],
  });

  await client.waitForTransactionReceipt({ hash });

  const [market] = await db
    .update(markets)
    .set({ ...updated, updatedAt: new Date() })
    .where(eq(markets.conditionId, conditionId))
    .returning();

  return c.json(
    {
      conditionId: market.conditionId,
      tokenId: market.tokenId.toString(),
      minLtvBps: market.minLtvBps,
      maxLtvBps: market.maxLtvBps,
      resolutionTime: market.resolutionTime.toString(),
      originationCutoff: market.originationCutoff.toString(),
      active: market.active,
      name: market.name,
      description: market.description,
      imageUrl: market.imageUrl,
      category: market.category,
      txHash: hash,
    },
    200,
  );
};

export const pauseMarket: AppRouteHandler<PauseMarketRoute> = async (c) => {
  const { conditionId } = c.req.valid("param");

  const [existing] = await db
    .select()
    .from(markets)
    .where(eq(markets.conditionId, conditionId));

  if (!existing) {
    return c.json({ message: "Market not found" }, 404);
  }

  const operator = getOperatorClient();
  const client = getPublicClient();

  const hash = await operator.writeContract({
    address: getContract("core"),
    abi: poolCoreAbi,
    functionName: "pause_market",
    args: [conditionId as `0x${string}`],
  });

  await client.waitForTransactionReceipt({ hash });

  await db
    .update(markets)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(markets.conditionId, conditionId));

  return c.json({ txHash: hash, message: "Market paused" }, 200);
};

export const pausePool: AppRouteHandler<PausePoolRoute> = async (c) => {
  const operator = getOperatorClient();
  const client = getPublicClient();

  const hash = await operator.writeContract({
    address: getContract("pool"),
    abi: lendingPoolAbi,
    functionName: "pause",
  });

  await client.waitForTransactionReceipt({ hash });

  return c.json({ txHash: hash, message: "Pool paused" }, 200);
};

export const unpausePool: AppRouteHandler<UnpausePoolRoute> = async (c) => {
  const operator = getOperatorClient();
  const client = getPublicClient();

  const hash = await operator.writeContract({
    address: getContract("pool"),
    abi: lendingPoolAbi,
    functionName: "unpause",
  });

  await client.waitForTransactionReceipt({ hash });

  return c.json({ txHash: hash, message: "Pool unpaused" }, 200);
};
