import { z } from "@hono/zod-openapi";

export const UserSelectSchema = z
  .object({
    id: z.string().openapi({
      example: "123",
    }),
    name: z.string().openapi({
      example: "John Doe",
    }),
  })
  .openapi("UserSelect");

export const UserInsertSchema = z
  .object({
    name: z.string().openapi({
      example: "John Doe",
    }),
  })
  .openapi("UserInsert");

export const patchUserSchema = UserInsertSchema.partial();
