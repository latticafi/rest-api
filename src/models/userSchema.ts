import { z } from "@hono/zod-openapi";

export const UserSelectSchema = z
  .object({
    id: z.number().openapi({
      example: 123,
    }),
    name: z.string().openapi({
      example: "John Doe",
    }),
    email: z.email().openapi({
      example: "john@example.com",
    }),
    createdAt: z.string().nullable().openapi({
      example: "2025-01-01T00:00:00.000Z",
    }),
  })
  .openapi("UserSelect");

export const UserInsertSchema = z
  .object({
    name: z.string().openapi({
      example: "John Doe",
    }),
    email: z.email().openapi({
      example: "john@example.com",
    }),
  })
  .openapi("UserInsert");

export const patchUserSchema = UserInsertSchema.partial();
