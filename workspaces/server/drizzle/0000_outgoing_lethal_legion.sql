CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_user_id` text NOT NULL,
	`provider` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provider_user_unique` ON `users` (`provider_user_id`,`provider`);--> statement-breakpoint
CREATE TABLE `usersprofile` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text,
	`profile_image_url` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
