import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";
import type { MeRoute, PatchMeRoute } from "@/routes/users/users.routes";

import { db } from "@/db";
import { users } from "@/db/schema";

export const me: AppRouteHandler<MeRoute> = async (c) => {
  const walletAddress = c.get("walletAddress");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.walletAddress, walletAddress));

  if (!user) {
    return c.json({ message: "Not Found" }, 404);
  }

  return c.json(user, 200);
};

export const patchMe: AppRouteHandler<PatchMeRoute> = async (c) => {
  const walletAddress = c.get("walletAddress");
  const updates = c.req.valid("json");

  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.walletAddress, walletAddress))
    .returning();

  if (!user) {
    return c.json({ message: "Not Found" }, 404);
  }

  return c.json(user, 200);
};
