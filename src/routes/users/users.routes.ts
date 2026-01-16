import { createRoute, z } from "@hono/zod-openapi";

import {
  createErrorSchema,
  createMessageObjectSchema,
  idParamsSchema,
} from "@/models/shared";
import {
  patchUserSchema,
  UserInsertSchema,
  UserSelectSchema,
} from "@/models/userSchema";

export const list = createRoute({
  operationId: "getUsers",
  path: "/users",
  method: "get",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(UserSelectSchema),
        },
      },
      description: "A list of users",
    },
  },
});

export const create = createRoute({
  operationId: "createUser",
  path: "/users",
  method: "post",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserInsertSchema,
        },
      },
      description: "The user to create",
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
      description: "The created user",
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
          schema: createErrorSchema(patchUserSchema),
        },
      },
      description: "The validation error(s)",
    },
  },
});

export const getOne = createRoute({
  operationId: "getUserById",
  path: `/users/{id}`,
  method: "get",
  request: {
    params: idParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: UserSelectSchema,
        },
      },
      description: "The requested user",
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
          schema: createErrorSchema(patchUserSchema),
        },
      },
      description: "Invalid id error",
    },
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
