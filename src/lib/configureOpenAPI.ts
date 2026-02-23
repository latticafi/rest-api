import type { AppOpenAPI } from "@/lib/types";

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
  security: [
    {
      Bearer: [],
    },
  ],
};

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc31("/doc", openAPIObjectConfig);

  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Privy access token",
  });
}
