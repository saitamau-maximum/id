CREATE TABLE `oauth_grants` (
	`user_id` text NOT NULL,
	`client_id` text NOT NULL,
	`scope_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`revoked_at` integer,
	PRIMARY KEY(`user_id`, `client_id`, `scope_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `oauth_grants_user_client_idx` ON `oauth_grants` (`user_id`,`client_id`);