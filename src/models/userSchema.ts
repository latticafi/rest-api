import { z } from "@hono/zod-openapi";

export const UserSelectSchema = z
  .object({
    id: z.number().openapi({ example: 123 }),
    walletAddress: z.string().openapi({
      example: "0x1234567890abcdef1234567890abcdef12345678",
    }),
    name: z.string().nullable().openapi({ example: "John Doe" }),
    email: z.string().nullable().openapi({ example: "john@example.com" }),
    createdAt: z.string().nullable().openapi({
      example: "2025-01-01T00:00:00.000Z",
    }),
  })
  .openapi("UserSelect");

export const PatchUserSchema = z
  .object({
    name: z.string().optional().openapi({ example: "John Doe" }),
    email: z.email().optional().openapi({ example: "john@example.com" }),
  })
  .openapi("PatchUser");
