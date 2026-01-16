import { z } from "@hono/zod-openapi";

import type { ZodSchema } from "@/lib/types";

export const idParamsSchema = z.object({
  id: z
    .string()
    .min(3)
    .openapi({
      param: {
        name: "id",
        in: "path",
      },
      example: "423",
    })
    .openapi("idParams"),
});

export function createMessageObjectSchema(_message: string) {
  return z.object({
    message: z.string(),
  });
}

export function createErrorSchema<T extends ZodSchema>(schema: T) {
  const { error: _error } = schema.safeParse(
    schema instanceof z.ZodArray ? [] : {},
  );
  return z.object({
    success: z.boolean(),
    error: z.object({
      issues: z.array(
        z.object({
          code: z.string(),
          path: z.array(z.union([z.string(), z.number()])),
          message: z.string().optional(),
        }),
      ),
      name: z.string(),
    }),
  });
}
