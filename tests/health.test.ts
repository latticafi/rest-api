import { describe, expect, test } from "bun:test";

import app from "@/app";

describe("GET /health", () => {
  test("returns ok without auth", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  });
});
