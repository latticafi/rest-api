import type { RouteConfig, RouteHandler, z } from "@hono/zod-openapi";

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R>;
export type ZodSchema = z.ZodUnion | z.ZodObject | z.ZodArray<z.ZodObject>;
