import { z } from "@hono/zod-openapi";

export const TxResponseSchema = z
  .object({
    to: z.string(),
    data: z.string(),
  })
  .openapi("TxResponse");

export const DepositSchema = z
  .object({
    amount: z
      .string()
      .regex(/^\d+$/, "Must be a uint256")
      .openapi({ example: "1000000000" }),
  })
  .openapi("DepositRequest");

export const WithdrawSchema = z
  .object({
    shares: z
      .string()
      .regex(/^\d+$/, "Must be a uint256")
      .openapi({ example: "999000000" }),
  })
  .openapi("WithdrawRequest");

export const BorrowPrepareSchema = z
  .object({
    conditionId: z.string(),
    collateralAmount: z.string().regex(/^\d+$/),
    borrowAmount: z.string().regex(/^\d+$/),
    epochLength: z.string().regex(/^\d+$/),
    premiumBps: z.number().int(),
    deadline: z.number().int(),
    nonce: z.number().int(),
    signature: z.string(),
    price: z.string().regex(/^\d+$/),
    priceTimestamp: z.number().int(),
    priceDeadline: z.number().int(),
    priceSignature: z.string(),
  })
  .openapi("BorrowPrepareRequest");

export const RepaySchema = z
  .object({
    loanId: z
      .string()
      .regex(/^\d+$/, "Must be a uint256")
      .openapi({ example: "1" }),
  })
  .openapi("RepayRequest");

export const RollPrepareSchema = z
  .object({
    oldLoanId: z.string().regex(/^\d+$/),
    epochLength: z.string().regex(/^\d+$/),
    premiumBps: z.number().int(),
    deadline: z.number().int(),
    nonce: z.number().int(),
    signature: z.string(),
    price: z.string().regex(/^\d+$/),
    priceTimestamp: z.number().int(),
    priceDeadline: z.number().int(),
    priceSignature: z.string(),
  })
  .openapi("RollPrepareRequest");

export const ApprovalStatusSchema = z
  .object({
    usdc: z.object({
      allowance: z.string(),
      sufficient: z.boolean(),
    }),
    ctf: z.object({
      approved: z.boolean(),
    }),
  })
  .openapi("ApprovalStatus");

export const ApprovalPrepareSchema = z
  .object({
    token: z.enum(["usdc", "ctf"]).openapi({ example: "usdc" }),
  })
  .openapi("ApprovalPrepareRequest");
