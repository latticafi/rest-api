import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cleanDb, createExpiredToken, createTestToken } from "./setup";

import app from "@/app";

beforeEach(async () => {
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

describe("Auth Middleware", () => {
  test("returns 401 when no Authorization header is present", async () => {
    const res = await app.request("/users");
    expect(res.status).toBe(401);

    const body = (await res.json()) as { message: string };
    expect(body.message).toContain("Missing or malformed");
  });

  test("returns 401 when Authorization header is not Bearer", async () => {
    const res = await app.request("/users", {
      headers: { Authorization: "Basic some-credentials" },
    });
    expect(res.status).toBe(401);
  });

  test("returns 401 with a garbage token", async () => {
    const res = await app.request("/users", {
      headers: { Authorization: "Bearer garbage.invalid.token" },
    });
    expect(res.status).toBe(401);

    const body = (await res.json()) as { message: string };
    expect(body.message).toContain("Invalid or expired");
  });

  test("returns 401 with an expired token", async () => {
    const token = await createExpiredToken();
    const res = await app.request("/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  test("passes through with a valid token", async () => {
    const token = await createTestToken();
    const res = await app.request("/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});
