ALTER TABLE `users` ADD `is_pending` integer NOT NULL DEFAULT 0;
ALTER TABLE `users` MODIFY `is_pending` integer NOT NULL DEFAULT 1;--> statement-breakpoint

ALTER TABLE `users` ADD `invitation_id` text;
