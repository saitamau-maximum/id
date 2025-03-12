PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_social_links` (
	`user_id` text NOT NULL,
	`provider_id` integer NOT NULL,
	`url` text NOT NULL,
	PRIMARY KEY(`user_id`, `provider_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_social_links`("user_id", "provider_id", "url") SELECT "user_id", "provider_id", "url" FROM `social_links`;--> statement-breakpoint
DROP TABLE `social_links`;--> statement-breakpoint
ALTER TABLE `__new_social_links` RENAME TO `social_links`;--> statement-breakpoint
PRAGMA foreign_keys=ON;