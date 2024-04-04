CREATE TABLE IF NOT EXISTS "sns-phone-number" (
	"id" serial NOT NULL,
	"phone_number" text NOT NULL,
	"contact_of_user_id" integer,
	"is_user_self_number" boolean DEFAULT false,
	"country_code" varchar(10) NOT NULL,
	"created" timestamp DEFAULT now(),
	CONSTRAINT "uniqueNumberIndex" UNIQUE("phone_number","country_code")
);
--> statement-breakpoint
ALTER TABLE "sns-user" ADD COLUMN "created" timestamp DEFAULT now();--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "numberIndex" ON "sns-phone-number" ("phone_number","country_code");