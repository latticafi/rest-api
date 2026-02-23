import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "@/lib/types";

export default function createRouter() {
  return new OpenAPIHono<AppBindings>({ strict: false });
}
