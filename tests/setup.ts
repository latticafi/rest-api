import { mock, spyOn } from "bun:test";

import { db } from "@/db";
import { users } from "@/db/schema";

spyOn(console, "error").mockImplementation(() => {});

export const mockVerifyAuthToken = mock(() =>
  Promise.resolve({ userId: "did:privy:test-user-123", appId: "test-app-id" }),
);

mock.module("@/lib/privy", () => ({
  privy: {
    verifyAuthToken: mockVerifyAuthToken,
  },
}));

export async function cleanDb() {
  await db.delete(users);
}
