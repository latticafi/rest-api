import { z } from "@hono/zod-openapi";

export const OnboardMarketSchema = z
  .object({
    conditionId: z.string().openapi({
      example:
        "0xcafe000000000000000000000000000000000000000000000000000000000000",
    }),
    tokenId: z.string().openapi({ example: "12345678" }),
    minLtvBps: z.number().int().min(0).max(9500).openapi({ example: 3000 }),
    maxLtvBps: z.number().int().min(0).max(9500).openapi({ example: 8500 }),
    resolutionTime: z.number().int().openapi({ example: 1720000000 }),
    originationCutoff: z.number().int().openapi({ example: 1719900000 }),
  })
  .openapi("OnboardMarket");

export const UpdateMarketSchema = z
  .object({
    minLtvBps: z.number().int().min(0).max(9500).optional(),
    maxLtvBps: z.number().int().min(0).max(9500).optional(),
    resolutionTime: z.number().int().optional(),
    originationCutoff: z.number().int().optional(),
  })
  .openapi("UpdateMarket");

export const MarketResponseSchema = z
  .object({
    conditionId: z.string(),
    tokenId: z.string(),
    minLtvBps: z.number(),
    maxLtvBps: z.number(),
    resolutionTime: z.string(),
    originationCutoff: z.string(),
    active: z.boolean(),
    name: z.string().nullable(),
    description: z.string().nullable(),
    imageUrl: z.string().nullable(),
    category: z.string().nullable(),
    txHash: z.string().optional(),
  })
  .openapi("MarketResponse");

export const ConditionIdParamSchema = z.object({
  conditionId: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/, "Must be a bytes32 hex string")
    .openapi({
      param: { name: "conditionId", in: "path" },
      example:
        "0xcafe000000000000000000000000000000000000000000000000000000000000",
    }),
});

export const TxResultSchema = z
  .object({
    txHash: z.string(),
    message: z.string(),
  })
  .openapi("TxResult");
