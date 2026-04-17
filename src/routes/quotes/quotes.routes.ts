import { createRoute } from "@hono/zod-openapi";

import {
  QuoteRejectionSchema,
  QuoteRequestSchema,
  QuoteResponseSchema,
} from "@/models/quoteSchema";
import { createMessageObjectSchema } from "@/models/shared";

export const requestQuote = createRoute({
  operationId: "requestQuote",
  path: "/quotes",
  method: "post",
  request: {
    body: {
      content: { "application/json": { schema: QuoteRequestSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: QuoteResponseSchema,
        },
      },
      description: "Premium quote with price attestation",
    },
    400: {
      content: {
        "application/json": {
          schema: QuoteRejectionSchema,
        },
      },
      description: "Quote rejected by pricing engine",
    },
    404: {
      content: {
        "application/json": {
          schema: createMessageObjectSchema("Market not found or inactive"),
        },
      },
      description: "Market not found or inactive",
    },
    503: {
      content: {
        "application/json": {
          schema: createMessageObjectSchema("Price unavailable"),
        },
      },
      description: "Price feed unavailable for this market",
    },
  },
});

export type RequestQuoteRoute = typeof requestQuote;
