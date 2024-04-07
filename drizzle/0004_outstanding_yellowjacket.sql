ALTER TABLE "sns_contact_details" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sns_contact_details" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sns_users" ALTER COLUMN "spam_likelihood" SET DEFAULT '0';