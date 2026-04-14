import { createRoute } from "@hono/zod-openapi";

import {
  LenderBalanceSchema,
  LiquidationPreviewQuerySchema,
  LiquidationPreviewSchema,
  PoolSnapshotSchema,
} from "@/models/poolSchema";

export const snapshot = createRoute({
  operationId: "getPoolSnapshot",
  path: "/pool",
  method: "get",
  security: [],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PoolSnapshotSchema,
        },
      },
      description: "Current pool state",
    },
  },
});

export const previewLiquidation = createRoute({
  operationId: "previewLiquidationPrice",
  path: "/pool/preview-liquidation",
  method: "get",
  security: [],
  request: {
    query: LiquidationPreviewQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LiquidationPreviewSchema,
        },
      },
      description: "Projected liquidation price for given collateral/borrow",
    },
  },
});

export const lenderBalance = createRoute({
  operationId: "getLenderBalance",
  path: "/pool/balance",
  method: "get",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LenderBalanceSchema,
        },
      },
      description: "Authenticated lender's share balance and USD value",
    },
  },
});

export type SnapshotRoute = typeof snapshot;
export type PreviewLiquidationRoute = typeof previewLiquidation;
export type LenderBalanceRoute = typeof lenderBalance;
