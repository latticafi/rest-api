import { createRoute } from "@hono/zod-openapi";

import {
  MarketConditionIdParamSchema,
  MarketListSchema,
  MarketSchema,
} from "@/models/marketSchema";
import { createMessageObjectSchema } from "@/models/shared";

export const listMarkets = createRoute({
  operationId: "listMarkets",
  path: "/markets",
  method: "get",
  security: [],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MarketListSchema,
        },
      },
      description: "List of active markets",
    },
  },
});

export const getMarket = createRoute({
  operationId: "getMarket",
  path: "/markets/{conditionId}",
  method: "get",
  security: [],
  request: {
    params: MarketConditionIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: MarketSchema,
        },
      },
      description: "Market detail",
    },
    404: {
      content: {
        "application/json": {
          schema: createMessageObjectSchema("Not found"),
        },
      },
      description: "Market not found",
    },
  },
});

export type ListMarketsRoute = typeof listMarkets;
export type GetMarketRoute = typeof getMarket;
