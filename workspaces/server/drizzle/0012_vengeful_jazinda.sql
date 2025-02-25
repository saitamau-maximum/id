CREATE TABLE `calendar_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `calendar_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `start_at_idx` ON `calendar_events` (`start_at`);--> statement-breakpoint
CREATE INDEX `end_at_idx` ON `calendar_events` (`end_at`);