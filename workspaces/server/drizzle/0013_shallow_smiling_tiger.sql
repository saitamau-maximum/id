DROP TABLE `oauth_scopes`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_oauth_client_scopes` (
	`client_id` text NOT NULL,
	`scope_id` integer NOT NULL,
	PRIMARY KEY(`client_id`, `scope_id`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_client_scopes`("client_id", "scope_id") SELECT "client_id", "scope_id" FROM `oauth_client_scopes`;--> statement-breakpoint
DROP TABLE `oauth_client_scopes`;--> statement-breakpoint
ALTER TABLE `__new_oauth_client_scopes` RENAME TO `oauth_client_scopes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_oauth_token_scopes` (
	`token_id` integer NOT NULL,
	`scope_id` integer NOT NULL,
	PRIMARY KEY(`token_id`, `scope_id`),
	FOREIGN KEY (`token_id`) REFERENCES `oauth_tokens`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_token_scopes`("token_id", "scope_id") SELECT "token_id", "scope_id" FROM `oauth_token_scopes`;--> statement-breakpoint
DROP TABLE `oauth_token_scopes`;--> statement-breakpoint
ALTER TABLE `__new_oauth_token_scopes` RENAME TO `oauth_token_scopes`;--> statement-breakpoint
CREATE TABLE `__new_calendar_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_calendar_events`("id", "user_id", "title", "description", "start_at", "end_at") SELECT "id", "user_id", "title", "description", "start_at", "end_at" FROM `calendar_events`;--> statement-breakpoint
DROP TABLE `calendar_events`;--> statement-breakpoint
ALTER TABLE `__new_calendar_events` RENAME TO `calendar_events`;--> statement-breakpoint
CREATE INDEX `user_idx` ON `calendar_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `start_at_idx` ON `calendar_events` (`start_at`);--> statement-breakpoint
CREATE INDEX `end_at_idx` ON `calendar_events` (`end_at`);