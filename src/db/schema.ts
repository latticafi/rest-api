import {
  bigint,
  boolean,
  integer,
  pgTable,
  serial,
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

export const loans = pgTable("loans", {
  loanId: integer("loan_id").primaryKey(),
  borrower: text("borrower").notNull(),
  conditionId: text("condition_id").notNull(),
  tokenId: text("token_id").notNull(),
  collateralAmount: text("collateral_amount").notNull(),
  principal: text("principal").notNull(),
  premiumPaid: text("premium_paid").notNull(),
  interestDue: text("interest_due").notNull(),
  interestRateBps: integer("interest_rate_bps").notNull(),
  liquidationPrice: text("liquidation_price").notNull(),
  epochStart: bigint("epoch_start", { mode: "number" }).notNull(),
  epochEnd: bigint("epoch_end", { mode: "number" }).notNull(),
  status: text("status").notNull().default("active"),
  txHash: text("tx_hash").notNull(),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const depositEvents = pgTable("deposit_events", {
  id: serial("id").primaryKey(),
  lender: text("lender").notNull(),
  amount: text("amount").notNull(),
  shares: text("shares").notNull(),
  txHash: text("tx_hash").notNull(),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawEvents = pgTable("withdraw_events", {
  id: serial("id").primaryKey(),
  lender: text("lender").notNull(),
  shares: text("shares").notNull(),
  amount: text("amount").notNull(),
  txHash: text("tx_hash").notNull(),
  blockNumber: bigint("block_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const indexerCursor = pgTable("indexer_cursor", {
  id: integer("id").primaryKey().default(1),
  lastBlock: bigint("last_block", { mode: "number" }).notNull(),
});
