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
ALTER TABLE `__new_oauth_token_scopes` RENAME TO `oauth_token_scopes`;