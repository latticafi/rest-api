ALTER TABLE "users" ADD COLUMN "privy_did" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_privy_did_unique" UNIQUE("privy_did");