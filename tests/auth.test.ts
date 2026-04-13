import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import app from "@/app";

import {
  cleanDb,
  createSiwePayload,
  getAuthToken,
  TEST_ADDRESS,
} from "./setup";

beforeEach(async () => {
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

describe("GET /auth/nonce", () => {
  test("returns a nonce without auth", async () => {
    const res = await app.request("/auth/nonce");
    expect(res.status).toBe(200);

    const body = (await res.json()) as { nonce: string };
    expect(body.nonce).toBeDefined();
    expect(body.nonce.length).toBeGreaterThan(0);
  });
});

describe("POST /auth/verify", () => {
  test("returns JWT for valid SIWE signature", async () => {
    const nonceRes = await app.request("/auth/nonce");
    const { nonce } = (await nonceRes.json()) as { nonce: string };
    const { message, signature } = await createSiwePayload(nonce);

    const res = await app.request("/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { token: string; walletAddress: string };
    expect(body.token).toBeDefined();
    expect(body.walletAddress).toBe(TEST_ADDRESS);
  });

  test("rejects reused nonce", async () => {
    const nonceRes = await app.request("/auth/nonce");
    const { nonce } = (await nonceRes.json()) as { nonce: string };
    const { message, signature } = await createSiwePayload(nonce);

    await app.request("/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });

    const res = await app.request("/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });

    expect(res.status).toBe(401);
  });

  test("rejects garbage signature", async () => {
    const nonceRes = await app.request("/auth/nonce");
    const { nonce } = (await nonceRes.json()) as { nonce: string };
    const { message } = await createSiwePayload(nonce);

    const res = await app.request("/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature: "0xdead" }),
    });

    expect(res.status).toBe(401);
  });

  test("rejects malformed SIWE message", async () => {
    const res = await app.request("/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "not a siwe message",
        signature: "0xdead",
      }),
    });

    expect(res.status).toBe(401);
  });
});

describe("Auth middleware", () => {
  test("returns 401 when no Authorization header", async () => {
    const res = await app.request("/users/me");
    expect(res.status).toBe(401);
  });

  test("returns 401 with garbage token", async () => {
    const res = await app.request("/users/me", {
      headers: { Authorization: "Bearer garbage.invalid.token" },
    });
    expect(res.status).toBe(401);
  });

  test("passes with valid JWT", async () => {
    const token = await getAuthToken(app);
    const res = await app.request("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});
