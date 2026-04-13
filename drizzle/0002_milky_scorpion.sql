ALTER TABLE "users" DROP CONSTRAINT "users_privy_did_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "wallet_address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "privy_did";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address");