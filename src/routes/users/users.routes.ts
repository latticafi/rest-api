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
    201: {
      content: {
        "application/json": {
          schema: UserSelectSchema,
        },
      },
      description: "The created user",
    },
    422: {
      content: {
        "application/json": {
          schema: createErrorSchema(UserInsertSchema),
        },
      },
      description: "The validation error(s)",
    },
  },
});

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
    400: {
      content: {
        "application/json": {
          schema: createErrorSchema(idParamsSchema),
        },
      },
      description: "Invalid id error",
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

export const patch = createRoute({
  operationId: "patchUser",
  path: "/users/{id}",
  method: "patch",
  request: {
    params: idParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: patchUserSchema,
        },
      },
      description: "Fields to update",
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
    400: {
      content: {
        "application/json": {
          schema: createErrorSchema(idParamsSchema),
        },
      },
      description: "Invalid id error",
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
      description: "Validation error(s)",
    },
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type MeRoute = typeof me;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
