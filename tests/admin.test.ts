import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import app from "@/app";

import { cleanDb, getAuthToken, nonAdminAccount, testAccount } from "./setup";

const ADMIN_ROUTES = [
  {
    method: "POST",
    path: "/admin/markets",
    body: {
      conditionId: "0x01",
      tokenId: "1",
      minLtvBps: 3000,
      maxLtvBps: 8500,
      resolutionTime: 1720000000,
      originationCutoff: 1719900000,
    },
  },
  {
    method: "PATCH",
    path: "/admin/markets/0xcafe000000000000000000000000000000000000000000000000000000000000",
    body: { minLtvBps: 4000 },
  },
  {
    method: "POST",
    path: "/admin/markets/0xcafe000000000000000000000000000000000000000000000000000000000000/pause",
  },
  { method: "POST", path: "/admin/pool/pause" },
  { method: "POST", path: "/admin/pool/unpause" },
];

beforeEach(async () => {
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

describe("Admin authorization", () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route.method} ${route.path} returns 401 without auth`, async () => {
      const res = await app.request(route.path, {
        method: route.method,
        headers: { "Content-Type": "application/json" },
        body: route.body ? JSON.stringify(route.body) : undefined,
      });
      expect(res.status).toBe(401);
    });

    test(`${route.method} ${route.path} returns 403 for non-admin wallet`, async () => {
      const token = await getAuthToken(app, nonAdminAccount);
      const res = await app.request(route.path, {
        method: route.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: route.body ? JSON.stringify(route.body) : undefined,
      });
      expect(res.status).toBe(403);
    });
  }
});

describe("Admin validation", () => {
  test("POST /admin/markets rejects missing fields", async () => {
    const token = await getAuthToken(app, testAccount);
    const res = await app.request("/admin/markets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conditionId: "0x01" }),
    });
    expect(res.status).toBe(422);
  });

  test("POST /admin/markets rejects maxLtvBps > 9500", async () => {
    const token = await getAuthToken(app, testAccount);
    const res = await app.request("/admin/markets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conditionId:
          "0xcafe000000000000000000000000000000000000000000000000000000000000",
        tokenId: "123",
        minLtvBps: 3000,
        maxLtvBps: 10000,
        resolutionTime: 1720000000,
        originationCutoff: 1719900000,
      }),
    });
    expect(res.status).toBe(422);
  });

  test("PATCH /admin/markets/:conditionId rejects invalid conditionId format", async () => {
    const token = await getAuthToken(app, testAccount);
    const res = await app.request("/admin/markets/not-a-bytes32", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ minLtvBps: 4000 }),
    });
    expect(res.status).toBe(400);
  });
});
