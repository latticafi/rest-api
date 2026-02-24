import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cleanDb, mockVerifyAuthToken } from "./setup";

import app from "@/app";

beforeEach(async () => {
  await cleanDb();
  mockVerifyAuthToken.mockReset();
  mockVerifyAuthToken.mockImplementation(() =>
    Promise.resolve({
      userId: "did:privy:test-user-123",
      appId: "test-app-id",
    }),
  );
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

  test("returns 401 when token verification fails", async () => {
    mockVerifyAuthToken.mockImplementation(() =>
      Promise.reject(new Error("Token expired")),
    );

    const res = await app.request("/users", {
      headers: { Authorization: "Bearer expired-token" },
    });
    expect(res.status).toBe(401);

    const body = (await res.json()) as { message: string };
    expect(body.message).toContain("Invalid or expired");
  });

  test("passes through when token is valid", async () => {
    const res = await app.request("/users", {
      headers: { Authorization: "Bearer valid-token" },
    });

    expect(res.status).toBe(200);
    expect(mockVerifyAuthToken).toHaveBeenCalledTimes(1);
  });
});
