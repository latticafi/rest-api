import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { cleanDb, createTestToken } from "./setup";

import app from "@/app";
import { db } from "@/db";
import { users } from "@/db/schema";

// Helpers

async function req(path: string, init?: RequestInit) {
  const token = await createTestToken();
  const { headers, ...rest } = init ?? {};
  return app.request(path, {
    ...rest,
    headers: { Authorization: `Bearer ${token}`, ...headers },
  });
}

async function jsonReq(path: string, body: unknown, init?: RequestInit) {
  const { headers, method, ...rest } = init ?? {};
  return req(path, {
    method: method ?? "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    ...rest,
  });
}

async function seedUser(data: {
  name: string;
  email: string;
  privyDid: string;
}) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

// Setup/Teardown

beforeEach(async () => {
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

// GET /users

describe("GET /users", () => {
  test("returns empty array when no users exist", async () => {
    const res = await req("/users");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test("returns all users", async () => {
    await seedUser({
      privyDid: "did:privy:1",
      name: "Alice",
      email: "alice@test.com",
    });
    await seedUser({
      privyDid: "did:privy:2",
      name: "Bob",
      email: "bob@test.com",
    });

    const res = await req("/users");
    expect(res.status).toBe(200);

    const body = (await res.json()) as any[];
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe("Alice");
    expect(body[1].name).toBe("Bob");
  });
});

// POST /users

describe("POST /users", () => {
  test("creates a user and returns 201", async () => {
    const res = await jsonReq("/users", {
      name: "Charlie",
      email: "charlie@test.com",
    });

    expect(res.status).toBe(201);

    const body = (await res.json()) as any;
    expect(body.name).toBe("Charlie");
    expect(body.email).toBe("charlie@test.com");
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
  });

  test("persists user with correct privyDid from token", async () => {
    await jsonReq("/users", { name: "Persisted", email: "persist@test.com" });

    const all = await db.select().from(users);
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Persisted");
    expect(all[0].privyDid).toBe("did:privy:test-user-123");
  });

  test("returns 422 for invalid body (missing email)", async () => {
    const res = await jsonReq("/users", { name: "NoEmail" });
    expect(res.status).toBe(422);
  });

  test("returns 422 for invalid email format", async () => {
    const res = await jsonReq("/users", {
      name: "BadEmail",
      email: "not-an-email",
    });
    expect(res.status).toBe(422);
  });

  test("returns 422 for empty body", async () => {
    const res = await jsonReq("/users", {});
    expect(res.status).toBe(422);
  });
});

// GET /users/:id

describe("GET /users/:id", () => {
  test("returns a user by ID", async () => {
    const user = await seedUser({
      privyDid: "did:privy:1",
      name: "Alice",
      email: "alice@test.com",
    });

    const res = await req(`/users/${user.id}`);
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.name).toBe("Alice");
    expect(body.id).toBe(user.id);
  });

  test("returns 404 for non-existent user", async () => {
    const res = await req("/users/999999");
    expect(res.status).toBe(404);

    const body = (await res.json()) as { message: string };
    expect(body.message).toBe("Not Found");
  });

  test("returns 400 for non-numeric ID", async () => {
    const res = await req("/users/abc");
    expect(res.status).toBe(400);
  });
});

// PATCH /users/:id

describe("PATCH /users/:id", () => {
  test("updates a user's name", async () => {
    const user = await seedUser({
      privyDid: "did:privy:1",
      name: "Alice",
      email: "alice@test.com",
    });

    const res = await jsonReq(
      `/users/${user.id}`,
      { name: "Alice Updated" },
      { method: "PATCH" },
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.name).toBe("Alice Updated");
    expect(body.email).toBe("alice@test.com");
  });

  test("updates a user's email", async () => {
    const user = await seedUser({
      privyDid: "did:privy:1",
      name: "Alice",
      email: "alice@test.com",
    });

    const res = await jsonReq(
      `/users/${user.id}`,
      { email: "new@test.com" },
      { method: "PATCH" },
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.email).toBe("new@test.com");
  });

  test("persists updates to the database", async () => {
    const user = await seedUser({
      privyDid: "did:privy:1",
      name: "Alice",
      email: "alice@test.com",
    });

    await jsonReq(
      `/users/${user.id}`,
      { name: "Updated" },
      { method: "PATCH" },
    );

    const [dbUser] = await db.select().from(users);
    expect(dbUser.name).toBe("Updated");
  });

  test("returns 404 when patching non-existent user", async () => {
    const res = await jsonReq(
      "/users/999999",
      { name: "Ghost" },
      { method: "PATCH" },
    );
    expect(res.status).toBe(404);
  });

  test("returns 400 for non-numeric ID", async () => {
    const res = await jsonReq(
      "/users/abc",
      { name: "Test" },
      { method: "PATCH" },
    );
    expect(res.status).toBe(400);
  });
});

// 404

describe("Not Found", () => {
  test("returns 404 for unknown routes", async () => {
    const res = await req("/nonexistent");
    expect(res.status).toBe(404);
  });
});
