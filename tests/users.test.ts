import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import app from "@/app";

import { cleanDb, getAuthToken, TEST_ADDRESS } from "./setup";

let token: string;

beforeEach(async () => {
  await cleanDb();
  token = await getAuthToken(app);
});

afterEach(async () => {
  await cleanDb();
});

async function req(path: string, init?: RequestInit) {
  const { headers, ...rest } = init ?? {};
  return app.request(path, {
    ...rest,
    headers: { Authorization: `Bearer ${token}`, ...headers },
  });
}

describe("GET /users/me", () => {
  test("returns the authenticated user", async () => {
    const res = await req("/users/me");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.walletAddress).toBe(TEST_ADDRESS);
    expect(body.id).toBeDefined();
  });

  test("user is auto-created on first auth", async () => {
    const res = await req("/users/me");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.name).toBeNull();
    expect(body.email).toBeNull();
  });
});

describe("PATCH /users/me", () => {
  test("updates name and email", async () => {
    const res = await req("/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice", email: "alice@test.com" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.name).toBe("Alice");
    expect(body.email).toBe("alice@test.com");
  });

  test("partial update only changes provided fields", async () => {
    await req("/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice", email: "alice@test.com" }),
    });

    const res = await req("/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bob" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.name).toBe("Bob");
    expect(body.email).toBe("alice@test.com");
  });
});
