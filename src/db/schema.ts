import {
  bigint,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  walletAddress: text("wallet_address").notNull().unique(),
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const markets = pgTable("markets", {
  conditionId: text("condition_id").primaryKey(),
  tokenId: text("token_id").notNull(),
  minLtvBps: integer("min_ltv_bps").notNull(),
  maxLtvBps: integer("max_ltv_bps").notNull(),
  resolutionTime: bigint("resolution_time", { mode: "number" })
    .notNull()
    .default(0),
  originationCutoff: bigint("origination_cutoff", { mode: "number" })
    .notNull()
    .default(0),
  active: boolean("active").notNull().default(true),
  name: text("name"),
  description: text("description"),
  imageUrl: text("image_url"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
