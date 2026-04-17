import { createRoute } from "@hono/zod-openapi";

import { PriceConditionIdParamSchema, PriceSchema } from "@/models/priceSchema";
import { createMessageObjectSchema } from "@/models/shared";

export const getPrice = createRoute({
  operationId: "getPrice",
  path: "/prices/{conditionId}",
  method: "get",
  security: [],
  request: {
    params: PriceConditionIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PriceSchema,
        },
      },
      description: "Current mid price from live orderbook",
    },
    404: {
      content: {
        "application/json": {
          schema: createMessageObjectSchema("Price not available"),
        },
      },
      description: "No price data for this market",
    },
  },
});

export type GetPriceRoute = typeof getPrice;
