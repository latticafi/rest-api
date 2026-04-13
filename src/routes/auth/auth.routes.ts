import { createRoute } from "@hono/zod-openapi";

import {
  NonceResponseSchema,
  VerifyRequestSchema,
  VerifyResponseSchema,
} from "@/models/authSchema";
import { createMessageObjectSchema } from "@/models/shared";

export const nonce = createRoute({
  operationId: "getNonce",
  path: "/auth/nonce",
  method: "get",
  security: [],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NonceResponseSchema,
        },
      },
      description: "A SIWE nonce for wallet signature",
    },
  },
});

export const verify = createRoute({
  operationId: "verifySignature",
  path: "/auth/verify",
  method: "post",
  security: [],
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyRequestSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: VerifyResponseSchema,
        },
      },
      description: "JWT token for authenticated session",
    },
    401: {
      content: {
        "application/json": {
          schema: createMessageObjectSchema("Invalid signature or nonce"),
        },
      },
      description: "Authentication failed",
    },
  },
});

export type NonceRoute = typeof nonce;
export type VerifyRoute = typeof verify;
