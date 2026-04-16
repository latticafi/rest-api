import { createRoute } from "@hono/zod-openapi";

import {
  ConditionIdParamSchema,
  MarketResponseSchema,
  OnboardMarketSchema,
  TxResultSchema,
  UpdateMarketSchema,
} from "@/models/adminSchema";
import { createMessageObjectSchema } from "@/models/shared";

export const onboardMarket = createRoute({
  operationId: "onboardMarket",
  path: "/admin/markets",
  method: "post",
  request: {
    body: {
      content: { "application/json": { schema: OnboardMarketSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: MarketResponseSchema } },
      description: "Market onboarded",
    },
    409: {
      content: {
        "application/json": { schema: createMessageObjectSchema("Conflict") },
      },
      description: "Market already exists",
    },
  },
});

export const updateMarket = createRoute({
  operationId: "updateMarket",
  path: "/admin/markets/{conditionId}",
  method: "patch",
  request: {
    params: ConditionIdParamSchema,
    body: {
      content: { "application/json": { schema: UpdateMarketSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: MarketResponseSchema } },
      description: "Market updated",
    },
    404: {
      content: {
        "application/json": { schema: createMessageObjectSchema("Not found") },
      },
      description: "Market not found",
    },
  },
});

export const pauseMarket = createRoute({
  operationId: "pauseMarket",
  path: "/admin/markets/{conditionId}/pause",
  method: "post",
  request: {
    params: ConditionIdParamSchema,
  },
  responses: {
    200: {
      content: { "application/json": { schema: TxResultSchema } },
      description: "Market paused",
    },
    404: {
      content: {
        "application/json": { schema: createMessageObjectSchema("Not found") },
      },
      description: "Market not found",
    },
  },
});

export const pausePool = createRoute({
  operationId: "pausePool",
  path: "/admin/pool/pause",
  method: "post",
  responses: {
    200: {
      content: { "application/json": { schema: TxResultSchema } },
      description: "Pool paused",
    },
  },
});

export const unpausePool = createRoute({
  operationId: "unpausePool",
  path: "/admin/pool/unpause",
  method: "post",
  responses: {
    200: {
      content: { "application/json": { schema: TxResultSchema } },
      description: "Pool unpaused",
    },
  },
});

export type OnboardMarketRoute = typeof onboardMarket;
export type UpdateMarketRoute = typeof updateMarket;
export type PauseMarketRoute = typeof pauseMarket;
export type PausePoolRoute = typeof pausePool;
export type UnpausePoolRoute = typeof unpausePool;
