import { createRoute } from "@hono/zod-openapi";

import { createErrorSchema, createMessageObjectSchema } from "@/models/shared";
import { PatchUserSchema, UserSelectSchema } from "@/models/userSchema";

export const me = createRoute({
  operationId: "getCurrentUser",
  path: "/users/me",
  method: "get",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSelectSchema,
        },
      },
      description: "The authenticated user",
    },
    404: {
      content: {
        "application/json": {
          schema: createMessageObjectSchema("Not Found"),
        },
      },
      description: "User not found",
    },
  },
});

export const patchMe = createRoute({
  operationId: "updateCurrentUser",
  path: "/users/me",
  method: "patch",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PatchUserSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSelectSchema,
        },
      },
      description: "The updated user",
    },
    404: {
      content: {
        "application/json": {
          schema: createMessageObjectSchema("Not Found"),
        },
      },
      description: "User not found",
    },
    422: {
      content: {
        "application/json": {
          schema: createErrorSchema(PatchUserSchema),
        },
      },
      description: "Validation error(s)",
    },
  },
});

export type MeRoute = typeof me;
export type PatchMeRoute = typeof patchMe;
