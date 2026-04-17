import { createRoute } from "@hono/zod-openapi";

import {
  HistorySchema,
  LoanFilterSchema,
  LoanIdParamSchema,
  LoanListSchema,
  LoanSchema,
} from "@/models/positionSchema";
import { createMessageObjectSchema } from "@/models/shared";

export const listLoans = createRoute({
  operationId: "listMyLoans",
  path: "/users/me/loans",
  method: "get",
  request: {
    query: LoanFilterSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoanListSchema,
        },
      },
      description: "Loans for the authenticated wallet",
    },
  },
});

export const getLoan = createRoute({
  operationId: "getMyLoan",
  path: "/users/me/loans/{loanId}",
  method: "get",
  request: {
    params: LoanIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoanSchema,
        },
      },
      description: "Loan detail with current health factor",
    },
    404: {
      content: {
        "application/json": {
          schema: createMessageObjectSchema("Loan not found"),
        },
      },
      description: "Loan not found or not owned by this wallet",
    },
  },
});

export const getHistory = createRoute({
  operationId: "getMyHistory",
  path: "/users/me/history",
  method: "get",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: HistorySchema,
        },
      },
      description: "Combined event history for the authenticated wallet",
    },
  },
});

export type ListLoansRoute = typeof listLoans;
export type GetLoanRoute = typeof getLoan;
export type GetHistoryRoute = typeof getHistory;
