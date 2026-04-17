import { z } from "@hono/zod-openapi";

export const QuoteRequestSchema = z
  .object({
    conditionId: z.string().openapi({
      example:
        "0xcafe000000000000000000000000000000000000000000000000000000000000",
    }),
    borrowAmount: z.number().int().positive().openapi({ example: 400_000_000 }),
    collateralAmount: z
      .number()
      .int()
      .positive()
      .openapi({ example: 1_000_000_000 }),
    epochLength: z.number().int().positive().openapi({
      example: 86400,
      description: "Epoch duration in seconds",
    }),
  })
  .openapi("QuoteRequest");

export const QuoteBreakdownSchema = z
  .object({
    basePremiumBps: z.number(),
    volMultiplier: z.number(),
    premiumFloorApplied: z.boolean(),
    wangLambda: z.number(),
    physicalVar01: z.number(),
    wangVar01: z.number(),
    maxPositionUsdc: z.number(),
    liquidityCostBps: z.number(),
  })
  .openapi("QuoteBreakdown");

export const PriceAttestationSchema = z
  .object({
    conditionId: z.string(),
    price: z.string(),
    timestamp: z.number(),
    deadline: z.number(),
    signature: z.string(),
  })
  .openapi("PriceAttestation");

export const QuoteResponseSchema = z
  .object({
    premiumBps: z.number(),
    amount: z.number(),
    collateralAmount: z.number(),
    epochLength: z.number(),
    deadline: z.number(),
    nonce: z.number(),
    signature: z.string(),
    breakdown: QuoteBreakdownSchema,
    priceAttestation: PriceAttestationSchema,
  })
  .openapi("QuoteResponse");

export const QuoteRejectionSchema = z
  .object({
    rejected: z.literal(true),
    reason: z.string(),
    maxPositionUsdc: z.number(),
  })
  .openapi("QuoteRejection");
