import { z } from "@hono/zod-openapi";

export const MarketSchema = z
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
  })
  .openapi("Market");

export const MarketListSchema = z.array(MarketSchema).openapi("MarketList");

export const MarketConditionIdParamSchema = z.object({
  conditionId: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/, "Must be a bytes32 hex string")
    .openapi({
      param: { name: "conditionId", in: "path" },
      example:
        "0xcafe000000000000000000000000000000000000000000000000000000000000",
    }),
});
