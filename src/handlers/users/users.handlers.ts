import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";
import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
} from "@/routes/users/users.routes";

import { db } from "@/db";
import { users } from "@/db/schema";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const allUsers = await db.select().from(users);
  return c.json(allUsers, 200);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { name, email } = c.req.valid("json");
  const privyDid = c.get("privyDid");
  const [newUser] = await db
    .insert(users)
    .values({ name, email, privyDid })
    .returning();
  return c.json(newUser, 201);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(id)));

  if (!user) {
    return c.json({ message: "Not Found" }, 404);
  }

  return c.json(user, 200);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, Number(id)))
    .returning();

  if (!user) {
    return c.json({ message: "Not Found" }, 404);
  }

  return c.json(user, 200);
};
