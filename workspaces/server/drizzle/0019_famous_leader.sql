CREATE TABLE `calendar_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`location_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `calendar_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `start_at_idx` ON `calendar_events` (`start_at`);--> statement-breakpoint
CREATE INDEX `end_at_idx` ON `calendar_events` (`end_at`);