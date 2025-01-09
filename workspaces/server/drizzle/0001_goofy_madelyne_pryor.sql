CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text,
	`profile_image_url` text,
	`email` text,
	`student_id` text,
	`grade` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `grade_idx` ON `user_profiles` (`grade`);--> statement-breakpoint
DROP TABLE `usersprofile`;--> statement-breakpoint
ALTER TABLE `users` ADD `initialized_at` integer;