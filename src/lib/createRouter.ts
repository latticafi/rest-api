import { OpenAPIHono } from "@hono/zod-openapi";

export default function createRouter() {
  return new OpenAPIHono({ strict: false });
}
