CREATE TABLE `social_links` (
	`user_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`url` text NOT NULL,
	PRIMARY KEY(`user_id`, `provider_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
