ALTER TABLE "sns-user" RENAME TO "sns-users";--> statement-breakpoint
ALTER TABLE "sns-users" DROP CONSTRAINT "sns-user_email_unique";--> statement-breakpoint
ALTER TABLE "sns-users" ADD CONSTRAINT "sns-users_email_unique" UNIQUE("email");