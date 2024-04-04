CREATE TABLE IF NOT EXISTS "sns-spam-reports" (
	"id" serial NOT NULL,
	"phone_number_id" integer NOT NULL,
	"marked_by_user_id" integer NOT NULL,
	"created" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "phoneNumberIdIdx" ON "sns-spam-reports" ("phone_number_id");