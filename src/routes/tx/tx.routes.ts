import { createRoute } from "@hono/zod-openapi";

import {
  ApprovalPrepareSchema,
  ApprovalStatusSchema,
  BorrowPrepareSchema,
  DepositSchema,
  RepaySchema,
  RollPrepareSchema,
  TxResponseSchema,
  WithdrawSchema,
} from "@/models/txSchema";

export const depositPrepare = createRoute({
  operationId: "prepareDeposit",
  path: "/pool/deposit/prepare",
  method: "post",
  request: {
    body: {
      content: { "application/json": { schema: DepositSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: TxResponseSchema } },
      description: "Unsigned deposit transaction",
    },
  },
});

export const withdrawPrepare = createRoute({
  operationId: "prepareWithdraw",
  path: "/pool/withdraw/prepare",
  method: "post",
  request: {
    body: {
      content: { "application/json": { schema: WithdrawSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: TxResponseSchema } },
      description: "Unsigned withdraw transaction",
    },
  },
});

export const borrowPrepare = createRoute({
  operationId: "prepareBorrow",
  path: "/loans/borrow/prepare",
  method: "post",
  request: {
    body: {
      content: { "application/json": { schema: BorrowPrepareSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: TxResponseSchema } },
      description: "Unsigned borrow transaction",
    },
  },
});

export const repayPrepare = createRoute({
  operationId: "prepareRepay",
  path: "/loans/repay/prepare",
  method: "post",
  request: {
    body: {
      content: { "application/json": { schema: RepaySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: TxResponseSchema } },
      description: "Unsigned repay transaction",
    },
  },
});

export const rollPrepare = createRoute({
  operationId: "prepareRoll",
  path: "/loans/roll/prepare",
  method: "post",
  request: {
    body: {
      content: { "application/json": { schema: RollPrepareSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: TxResponseSchema } },
      description: "Unsigned roll transaction",
    },
  },
});

export const approvalStatus = createRoute({
  operationId: "getApprovalStatus",
  path: "/approvals/status",
  method: "get",
  responses: {
    200: {
      content: { "application/json": { schema: ApprovalStatusSchema } },
      description:
        "Current USDC and CTF approval status for the authenticated wallet",
    },
  },
});

export const approvalPrepare = createRoute({
  operationId: "prepareApproval",
  path: "/approvals/prepare",
  method: "post",
  request: {
    body: {
      content: { "application/json": { schema: ApprovalPrepareSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: TxResponseSchema } },
      description: "Unsigned approval transaction",
    },
  },
});

export type DepositPrepareRoute = typeof depositPrepare;
export type WithdrawPrepareRoute = typeof withdrawPrepare;
export type BorrowPrepareRoute = typeof borrowPrepare;
export type RepayPrepareRoute = typeof repayPrepare;
export type RollPrepareRoute = typeof rollPrepare;
export type ApprovalStatusRoute = typeof approvalStatus;
export type ApprovalPrepareRoute = typeof approvalPrepare;
