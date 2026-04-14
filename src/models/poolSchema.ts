import { z } from "@hono/zod-openapi";

export const PoolSnapshotSchema = z
  .object({
    totalAssets: z.string().openapi({ example: "1000000000000" }),
    totalBorrowed: z.string().openapi({ example: "400000000000" }),
    availableLiquidity: z.string().openapi({ example: "600000000000" }),
    utilization: z.number().openapi({ example: 4000 }),
    sharePrice: z.string().openapi({ example: "1000000" }),
    currentRate: z.number().openapi({ example: 700 }),
    maintenanceMargin: z.number().openapi({ example: 2000 }),
    reserveBalance: z.string().openapi({ example: "50000000000" }),
    reserveHealthy: z.boolean().openapi({ example: true }),
    circuitBroken: z.boolean().openapi({ example: false }),
    paused: z.boolean().openapi({ example: false }),
    totalLoans: z.number().openapi({ example: 42 }),
  })
  .openapi("PoolSnapshot");

export const LiquidationPreviewQuerySchema = z.object({
  collateral: z
    .string()
    .regex(/^\d+$/, "Must be a uint256")
    .openapi({
      example: "1000000000",
      param: { name: "collateral", in: "query" },
    }),
  borrow: z
    .string()
    .regex(/^\d+$/, "Must be a uint256")
    .openapi({ example: "400000000", param: { name: "borrow", in: "query" } }),
});

export const LiquidationPreviewSchema = z
  .object({
    liquidationPrice: z.string().openapi({ example: "480000000000000000" }),
  })
  .openapi("LiquidationPreview");

export const LenderBalanceSchema = z
  .object({
    shares: z.string().openapi({ example: "999999000000" }),
    value: z.string().openapi({ example: "1000000000000" }),
  })
  .openapi("LenderBalance");
