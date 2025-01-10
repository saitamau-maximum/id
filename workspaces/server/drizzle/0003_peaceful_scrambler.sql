ALTER TABLE `oauth_client_callback` RENAME TO `oauth_client_callbacks`;--> statement-breakpoint
ALTER TABLE `oauth_client_scope` RENAME TO `oauth_client_scopes`;--> statement-breakpoint
ALTER TABLE `oauth_client_secret` RENAME TO `oauth_client_secrets`;--> statement-breakpoint
ALTER TABLE `oauth_client` RENAME TO `oauth_clients`;--> statement-breakpoint
ALTER TABLE `oauth_connection` RENAME TO `oauth_connections`;--> statement-breakpoint
ALTER TABLE `oauth_provider` RENAME TO `oauth_providers`;--> statement-breakpoint
ALTER TABLE `oauth_scope` RENAME TO `oauth_scopes`;--> statement-breakpoint
ALTER TABLE `oauth_token_scope` RENAME TO `oauth_token_scopes`;--> statement-breakpoint
ALTER TABLE `oauth_token` RENAME TO `oauth_tokens`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_oauth_client_callbacks` (
	`client_id` text NOT NULL,
	`callback_url` text NOT NULL,
	PRIMARY KEY(`client_id`, `callback_url`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_client_callbacks`("client_id", "callback_url") SELECT "client_id", "callback_url" FROM `oauth_client_callbacks`;--> statement-breakpoint
DROP TABLE `oauth_client_callbacks`;--> statement-breakpoint
ALTER TABLE `__new_oauth_client_callbacks` RENAME TO `oauth_client_callbacks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_oauth_client_scopes` (
	`client_id` text NOT NULL,
	`scope_id` integer NOT NULL,
	PRIMARY KEY(`client_id`, `scope_id`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scope_id`) REFERENCES `oauth_scopes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_client_scopes`("client_id", "scope_id") SELECT "client_id", "scope_id" FROM `oauth_client_scopes`;--> statement-breakpoint
DROP TABLE `oauth_client_scopes`;--> statement-breakpoint
ALTER TABLE `__new_oauth_client_scopes` RENAME TO `oauth_client_scopes`;--> statement-breakpoint
CREATE TABLE `__new_oauth_client_secrets` (
	`client_id` text NOT NULL,
	`secret` text NOT NULL,
	`description` text,
	`issued_by` text NOT NULL,
	`issued_at` integer NOT NULL,
	PRIMARY KEY(`client_id`, `secret`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_client_secrets`("client_id", "secret", "description", "issued_by", "issued_at") SELECT "client_id", "secret", "description", "issued_by", "issued_at" FROM `oauth_client_secrets`;--> statement-breakpoint
DROP TABLE `oauth_client_secrets`;--> statement-breakpoint
ALTER TABLE `__new_oauth_client_secrets` RENAME TO `oauth_client_secrets`;--> statement-breakpoint
CREATE TABLE `__new_oauth_clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`logo_url` text,
	`owner_id` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_clients`("id", "name", "description", "logo_url", "owner_id") SELECT "id", "name", "description", "logo_url", "owner_id" FROM `oauth_clients`;--> statement-breakpoint
DROP TABLE `oauth_clients`;--> statement-breakpoint
ALTER TABLE `__new_oauth_clients` RENAME TO `oauth_clients`;--> statement-breakpoint
CREATE TABLE `__new_oauth_connections` (
	`user_id` text NOT NULL,
	`provider_id` integer NOT NULL,
	`provider_user_id` text NOT NULL,
	`email` text,
	`name` text,
	`profile_image_url` text,
	PRIMARY KEY(`user_id`, `provider_id`),
	FOREIGN KEY (`provider_id`) REFERENCES `oauth_providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_connections`("user_id", "provider_id", "provider_user_id", "email", "name", "profile_image_url") SELECT "user_id", "provider_id", "provider_user_id", "email", "name", "profile_image_url" FROM `oauth_connections`;--> statement-breakpoint
DROP TABLE `oauth_connections`;--> statement-breakpoint
ALTER TABLE `__new_oauth_connections` RENAME TO `oauth_connections`;--> statement-breakpoint
DROP INDEX IF EXISTS `oauth_scope_name_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_scopes_name_unique` ON `oauth_scopes` (`name`);--> statement-breakpoint
CREATE TABLE `__new_oauth_token_scopes` (
	`token_id` integer NOT NULL,
	`scope_id` integer NOT NULL,
	PRIMARY KEY(`token_id`, `scope_id`),
	FOREIGN KEY (`token_id`) REFERENCES `oauth_tokens`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scope_id`) REFERENCES `oauth_scopes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_token_scopes`("token_id", "scope_id") SELECT "token_id", "scope_id" FROM `oauth_token_scopes`;--> statement-breakpoint
DROP TABLE `oauth_token_scopes`;--> statement-breakpoint
ALTER TABLE `__new_oauth_token_scopes` RENAME TO `oauth_token_scopes`;--> statement-breakpoint
CREATE TABLE `__new_oauth_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` text NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`code_expires_at` integer NOT NULL,
	`code_used` integer NOT NULL,
	`redirect_uri` text,
	`access_token` text NOT NULL,
	`access_token_expires_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_tokens`("id", "client_id", "user_id", "code", "code_expires_at", "code_used", "redirect_uri", "access_token", "access_token_expires_at") SELECT "id", "client_id", "user_id", "code", "code_expires_at", "code_used", "redirect_uri", "access_token", "access_token_expires_at" FROM `oauth_tokens`;--> statement-breakpoint
DROP TABLE `oauth_tokens`;--> statement-breakpoint
ALTER TABLE `__new_oauth_tokens` RENAME TO `oauth_tokens`;--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_tokens_code_unique` ON `oauth_tokens` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_tokens_access_token_unique` ON `oauth_tokens` (`access_token`);