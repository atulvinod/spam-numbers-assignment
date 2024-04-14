CREATE TABLE IF NOT EXISTS "sns"."sns_contact_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"user_id" integer NOT NULL,
	"created" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sns"."sns_spam_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number_id" integer NOT NULL,
	"marked_by_user_id" integer NOT NULL,
	"created" timestamp DEFAULT now(),
	CONSTRAINT "uniqueMarkedSpam" UNIQUE("marked_by_user_id","phone_number_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sns"."sns_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"country_code" varchar(10) NOT NULL,
	"contact_of_id" integer,
	"is_registered_user" boolean DEFAULT false,
	"password" text,
	"created" timestamp DEFAULT now(),
	"spam_likelihood" numeric DEFAULT '0'
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "userIdIdx" ON "sns"."sns_contact_details" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "phoneNumberIdIdx" ON "sns"."sns_spam_reports" ("phone_number_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "phoneNumberIdx" ON "sns"."sns_users" ("phone_number","country_code");