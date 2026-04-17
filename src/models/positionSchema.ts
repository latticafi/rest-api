import { z } from "@hono/zod-openapi";

export const LoanSchema = z
  .object({
    loanId: z.number(),
    borrower: z.string(),
    conditionId: z.string(),
    tokenId: z.string(),
    collateralAmount: z.string(),
    principal: z.string(),
    premiumPaid: z.string(),
    interestDue: z.string(),
    interestRateBps: z.number(),
    liquidationPrice: z.string(),
    epochStart: z.number(),
    epochEnd: z.number(),
    status: z.string(),
    healthFactor: z.number().nullable(),
  })
  .openapi("Loan");

export const LoanListSchema = z.array(LoanSchema).openapi("LoanList");

export const LoanIdParamSchema = z.object({
  loanId: z
    .string()
    .regex(/^\d+$/, "Must be a number")
    .openapi({
      param: { name: "loanId", in: "path" },
      example: "1",
    }),
});

export const LoanFilterSchema = z.object({
  status: z
    .enum(["active", "repaid", "rolled", "liquidated"])
    .optional()
    .openapi({
      param: { name: "status", in: "query" },
      example: "active",
    }),
});

export const HistoryEventSchema = z
  .object({
    type: z.string(),
    txHash: z.string(),
    blockNumber: z.number(),
    data: z.record(z.string(), z.unknown()),
    createdAt: z.string().nullable(),
  })
  .openapi("HistoryEvent");

export const HistorySchema = z.array(HistoryEventSchema).openapi("History");
