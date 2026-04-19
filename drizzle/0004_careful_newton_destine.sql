CREATE TABLE "deposit_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"lender" text NOT NULL,
	"amount" text NOT NULL,
	"shares" text NOT NULL,
	"tx_hash" text NOT NULL,
	"block_number" bigint NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "indexer_cursor" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"last_block" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"loan_id" integer PRIMARY KEY NOT NULL,
	"borrower" text NOT NULL,
	"condition_id" text NOT NULL,
	"token_id" text NOT NULL,
	"collateral_amount" text NOT NULL,
	"principal" text NOT NULL,
	"premium_paid" text NOT NULL,
	"interest_due" text NOT NULL,
	"interest_rate_bps" integer NOT NULL,
	"liquidation_price" text NOT NULL,
	"epoch_start" bigint NOT NULL,
	"epoch_end" bigint NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"tx_hash" text NOT NULL,
	"block_number" bigint NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "withdraw_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"lender" text NOT NULL,
	"shares" text NOT NULL,
	"amount" text NOT NULL,
	"tx_hash" text NOT NULL,
	"block_number" bigint NOT NULL,
	"created_at" timestamp DEFAULT now()
);
