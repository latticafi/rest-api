CREATE TABLE "markets" (
	"condition_id" text PRIMARY KEY NOT NULL,
	"token_id" text NOT NULL,
	"min_ltv_bps" integer NOT NULL,
	"max_ltv_bps" integer NOT NULL,
	"resolution_time" bigint DEFAULT 0 NOT NULL,
	"origination_cutoff" bigint DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"name" text,
	"description" text,
	"image_url" text,
	"category" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
