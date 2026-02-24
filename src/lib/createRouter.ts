import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "@/lib/types";

import { defaultHook } from "./defaultHook";

export default function createRouter() {
  return new OpenAPIHono<AppBindings>({ strict: false, defaultHook });
}
