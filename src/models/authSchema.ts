import { z } from "@hono/zod-openapi";

export const NonceResponseSchema = z
  .object({
    nonce: z
      .string()
      .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  })
  .openapi("NonceResponse");

export const VerifyRequestSchema = z
  .object({
    message: z.string().openapi({
      example:
        "app.lattica.finance wants you to sign in with your Ethereum account:\n0x1234...",
    }),
    signature: z.string().openapi({
      example: "0xabcdef...",
    }),
  })
  .openapi("VerifyRequest");

export const VerifyResponseSchema = z
  .object({
    token: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiJ9..." }),
    walletAddress: z
      .string()
      .openapi({ example: "0x1234567890abcdef1234567890abcdef12345678" }),
  })
  .openapi("VerifyResponse");
