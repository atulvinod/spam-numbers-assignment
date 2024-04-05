CREATE TABLE IF NOT EXISTS "sns-contact-details" (
	"id" text,
	"email" text,
	"user_id" integer,
	"created" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sns_spam_reports" (
	"id" serial NOT NULL,
	"phone_number_id" integer NOT NULL,
	"marked_by_user_id" integer NOT NULL,
	"created" timestamp DEFAULT now(),
	CONSTRAINT "uniqueMarkedSpam" UNIQUE("marked_by_user_id","phone_number_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sns_users" (
	"id" text NOT NULL,
	"country_code" varchar(10) NOT NULL,
	"contact_of_id" integer,
	"is_registered_user" boolean DEFAULT false,
	"password" text,
	"created" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "userIdIdx" ON "sns-contact-details" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "phoneNumberIdIdx" ON "sns_spam_reports" ("phone_number_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "phoneNumberIdx" ON "sns_users" ("id","country_code");