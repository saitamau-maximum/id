ALTER TABLE `users` ADD `is_pending` integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY `is_pending` integer NOT NULL DEFAULT 1;

ALTER TABLE `users` ADD `invitation_id` text;
