DROP TABLE `oauth_providers`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_oauth_connections` (
	`user_id` text NOT NULL,
	`provider_id` integer NOT NULL,
	`provider_user_id` text NOT NULL,
	`email` text,
	`name` text,
	`profile_image_url` text,
	PRIMARY KEY(`user_id`, `provider_id`)
);
--> statement-breakpoint
INSERT INTO `__new_oauth_connections`("user_id", "provider_id", "provider_user_id", "email", "name", "profile_image_url") SELECT "user_id", "provider_id", "provider_user_id", "email", "name", "profile_image_url" FROM `oauth_connections`;--> statement-breakpoint
DROP TABLE `oauth_connections`;--> statement-breakpoint
ALTER TABLE `__new_oauth_connections` RENAME TO `oauth_connections`;--> statement-breakpoint
PRAGMA foreign_keys=ON;