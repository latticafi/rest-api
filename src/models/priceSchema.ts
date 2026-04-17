import { z } from "@hono/zod-openapi";

export const PriceSchema = z
  .object({
    conditionId: z.string(),
    bid: z.number(),
    ask: z.number(),
    mid: z.number(),
    updatedAt: z.number(),
  })
  .openapi("Price");

export const PriceConditionIdParamSchema = z.object({
  conditionId: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/, "Must be a bytes32 hex string")
    .openapi({
      param: { name: "conditionId", in: "path" },
      example:
        "0xcafe000000000000000000000000000000000000000000000000000000000000",
    }),
});
