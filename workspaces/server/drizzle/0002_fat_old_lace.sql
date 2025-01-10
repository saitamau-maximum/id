CREATE TABLE `oauth_client` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`logo_url` text,
	`owner_id` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oauth_client_callback` (
	`client_id` text NOT NULL,
	`callback_url` text NOT NULL,
	PRIMARY KEY(`client_id`, `callback_url`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oauth_client_scope` (
	`client_id` text NOT NULL,
	`scope_id` integer NOT NULL,
	PRIMARY KEY(`client_id`, `scope_id`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scope_id`) REFERENCES `oauth_scope`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oauth_client_secret` (
	`client_id` text NOT NULL,
	`secret` text NOT NULL,
	`description` text,
	`issued_by` text NOT NULL,
	`issued_at` integer NOT NULL,
	PRIMARY KEY(`client_id`, `secret`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oauth_connection` (
	`user_id` text NOT NULL,
	`provider_id` integer NOT NULL,
	`provider_user_id` text NOT NULL,
	`email` text,
	`name` text,
	`profile_image_url` text,
	PRIMARY KEY(`user_id`, `provider_id`),
	FOREIGN KEY (`provider_id`) REFERENCES `oauth_provider`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oauth_provider` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_scope` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_scope_name_unique` ON `oauth_scope` (`name`);--> statement-breakpoint
CREATE TABLE `oauth_token` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` text NOT NULL,
	`user_id` text NOT NULL,
	`code` text NOT NULL,
	`code_expires_at` integer NOT NULL,
	`code_used` integer NOT NULL,
	`redirect_uri` text,
	`access_token` text NOT NULL,
	`access_token_expires_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_token_code_unique` ON `oauth_token` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_token_access_token_unique` ON `oauth_token` (`access_token`);--> statement-breakpoint
CREATE TABLE `oauth_token_scope` (
	`token_id` integer NOT NULL,
	`scope_id` integer NOT NULL,
	PRIMARY KEY(`token_id`, `scope_id`),
	FOREIGN KEY (`token_id`) REFERENCES `oauth_token`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scope_id`) REFERENCES `oauth_scope`(`id`) ON UPDATE no action ON DELETE no action
);
