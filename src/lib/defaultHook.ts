import type { Hook } from "@hono/zod-openapi";

import type { AppBindings } from "@/lib/types";

const PARAM_FIELDS = new Set(["id", "conditionId"]);

export const defaultHook: Hook<any, AppBindings, any, any> = (result, c) => {
  if (!result.success) {
    const isParamError = result.error.issues.every((issue) =>
      PARAM_FIELDS.has(String(issue.path[0])),
    );
    return c.json(
      { success: false, error: result.error },
      isParamError ? 400 : 422,
    );
  }
};
