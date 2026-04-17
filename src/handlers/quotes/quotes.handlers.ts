import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";
import type { RequestQuoteRoute } from "@/routes/quotes/quotes.routes";

import { db } from "@/db";
import { markets } from "@/db/schema";
import { getContract } from "@/lib/chain";
import { getMidPrice } from "@/lib/priceFeed";
import { signPriceAttestation } from "@/lib/priceSigner";

const QUOTE_ENGINE_URL =
  process.env.QUOTE_ENGINE_URL || "http://quote-api:8000";
const PRICE_ATTESTATION_TTL_S = 120;

export const requestQuote: AppRouteHandler<RequestQuoteRoute> = async (c) => {
  const body = c.req.valid("json");
  const borrower = c.get("walletAddress");

  const [market] = await db
    .select()
    .from(markets)
    .where(eq(markets.conditionId, body.conditionId));

  if (!market || !market.active) {
    return c.json({ message: "Market not found or inactive" }, 404);
  }

  const priceData = getMidPrice(body.conditionId);
  if (!priceData) {
    return c.json({ message: "Price feed unavailable for this market" }, 503);
  }

  const chainId = Number(process.env.CHAIN_ID || 137);
  const oracleAddress = getContract("oracle");

  const quoteRes = await fetch(`${QUOTE_ENGINE_URL}/internal/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      borrower,
      condition_id: body.conditionId,
      amount: body.borrowAmount,
      collateral_amount: body.collateralAmount,
      duration: body.epochLength,
      chain_id: chainId,
      oracle_address: oracleAddress,
    }),
  });

  const quoteData = await quoteRes.json();

  if (quoteData.rejected) {
    return c.json(
      {
        rejected: true as const,
        reason: quoteData.reason,
        maxPositionUsdc: quoteData.max_position_usdc,
      },
      400,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const priceWad = BigInt(Math.floor(priceData.mid * 1e18));
  const poolAddress = getContract("pool");

  const priceSignature = await signPriceAttestation({
    poolAddress,
    conditionId: body.conditionId as `0x${string}`,
    price: priceWad,
    timestamp: BigInt(now),
    deadline: BigInt(now + PRICE_ATTESTATION_TTL_S),
    chainId,
  });

  return c.json(
    {
      premiumBps: quoteData.premium_bps,
      amount: quoteData.amount,
      collateralAmount: quoteData.collateral_amount,
      epochLength: quoteData.epoch_length,
      deadline: quoteData.deadline,
      nonce: quoteData.nonce,
      signature: quoteData.signature,
      breakdown: {
        basePremiumBps: quoteData.breakdown.base_premium_bps,
        volMultiplier: quoteData.breakdown.vol_multiplier,
        premiumFloorApplied: quoteData.breakdown.premium_floor_applied,
        wangLambda: quoteData.breakdown.wang_lambda,
        physicalVar01: quoteData.breakdown.physical_var_01,
        wangVar01: quoteData.breakdown.wang_var_01,
        maxPositionUsdc: quoteData.breakdown.max_position_usdc,
        liquidityCostBps: quoteData.breakdown.liquidity_cost_bps,
      },
      priceAttestation: {
        conditionId: body.conditionId,
        price: priceWad.toString(),
        timestamp: now,
        deadline: now + PRICE_ATTESTATION_TTL_S,
        signature: priceSignature,
      },
    },
    200,
  );
};
