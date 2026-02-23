import type { ContentfulStatusCode } from "hono/utils/http-status";

import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "@/lib/types";

export default function createApp() {
  const app = new OpenAPIHono<AppBindings>({ strict: false });

  app.notFound((context) => {
    return context.json(
      {
        message: `Not found - ${context.req.path}`,
      },
      404,
    );
  });

  app.onError((err, context) => {
    const currentStatus =
      "status" in err ? err.status : context.newResponse(null).status;
    const statusCode =
      currentStatus !== "OK" ? (currentStatus as ContentfulStatusCode) : 500;
    const env = process.env.NODE_ENV;
    return context.json(
      {
        message: err.message,

        stack: env === "production" ? undefined : err.stack,
      },
      statusCode,
    );
  });

  return app;
}
