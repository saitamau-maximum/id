CREATE TABLE `social_links` (
	`user_id` text NOT NULL,
	`url` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `social_links_user_idx` ON `social_links` (`user_id`);