import type { OpenAPIHono } from "@hono/zod-openapi";

import packageJson from "../../package.json";

export const openAPIObjectConfig = {
  openapi: "3.1.0",
  externalDocs: {
    description: "Users API documentation",
    url: "www.placeholder.com",
  },
  info: {
    version: packageJson.version,
    title: "Users API",
  },
};

export default function configureOpenAPI(app: OpenAPIHono) {
  app.doc31("/doc", openAPIObjectConfig);
}
