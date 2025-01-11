DROP INDEX IF EXISTS `provider_user_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `provider_user_id`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `provider`;