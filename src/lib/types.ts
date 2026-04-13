import type {
  OpenAPIHono,
  RouteConfig,
  RouteHandler,
  z,
} from "@hono/zod-openapi";

export interface AuthVariables {
  walletAddress: string;
}

export interface AppBindings {
  Variables: AuthVariables;
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
export type ZodSchema = z.ZodUnion | z.ZodObject | z.ZodArray<z.ZodObject>;
