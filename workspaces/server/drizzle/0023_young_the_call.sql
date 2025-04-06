PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_calendar_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`location_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_calendar_events`("id", "user_id", "title", "description", "start_at", "end_at", "location_id") SELECT "id", "user_id", "title", "description", "start_at", "end_at", "location_id" FROM `calendar_events`;--> statement-breakpoint
DROP TABLE `calendar_events`;--> statement-breakpoint
ALTER TABLE `__new_calendar_events` RENAME TO `calendar_events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `user_idx` ON `calendar_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `start_at_idx` ON `calendar_events` (`start_at`);--> statement-breakpoint
CREATE INDEX `end_at_idx` ON `calendar_events` (`end_at`);--> statement-breakpoint
CREATE TABLE `__new_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`expires_at` integer,
	`remaining_use` integer,
	`created_at` integer NOT NULL,
	`issued_by` text NOT NULL,
	FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_invites`("id", "title", "expires_at", "remaining_use", "created_at", "issued_by") SELECT "id", "title", "expires_at", "remaining_use", "created_at", "issued_by" FROM `invites`;--> statement-breakpoint
DROP TABLE `invites`;--> statement-breakpoint
ALTER TABLE `__new_invites` RENAME TO `invites`;--> statement-breakpoint
CREATE TABLE `__new_user_certifications` (
	`user_id` text NOT NULL,
	`certification_id` text NOT NULL,
	`certified_in` integer NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`user_id`, `certification_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_certifications`("user_id", "certification_id", "certified_in", "is_approved") SELECT "user_id", "certification_id", "certified_in", "is_approved" FROM `user_certifications`;--> statement-breakpoint
DROP TABLE `user_certifications`;--> statement-breakpoint
ALTER TABLE `__new_user_certifications` RENAME TO `user_certifications`;--> statement-breakpoint
CREATE INDEX `user_certifiedat_idx` ON `user_certifications` (`user_id`,`certified_in`);--> statement-breakpoint
CREATE TABLE `__new_user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text,
	`real_name` text,
	`real_name_kana` text,
	`display_id` text,
	`profile_image_url` text,
	`academic_email` text,
	`email` text,
	`student_id` text,
	`grade` text,
	`bio` text,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_profiles`("id", "user_id", "display_name", "real_name", "real_name_kana", "display_id", "profile_image_url", "academic_email", "email", "student_id", "grade", "bio", "updated_at") SELECT "id", "user_id", "display_name", "real_name", "real_name_kana", "display_id", "profile_image_url", "academic_email", "email", "student_id", "grade", "bio", "updated_at" FROM `user_profiles`;--> statement-breakpoint
DROP TABLE `user_profiles`;--> statement-breakpoint
ALTER TABLE `__new_user_profiles` RENAME TO `user_profiles`;--> statement-breakpoint
CREATE INDEX `grade_idx` ON `user_profiles` (`grade`);--> statement-breakpoint
CREATE UNIQUE INDEX `display_id_unique` ON `user_profiles` (`display_id`);--> statement-breakpoint
CREATE TABLE `__new_user_roles` (
	`user_id` text NOT NULL,
	`role_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_roles`("user_id", "role_id") SELECT "user_id", "role_id" FROM `user_roles`;--> statement-breakpoint
DROP TABLE `user_roles`;--> statement-breakpoint
ALTER TABLE `__new_user_roles` RENAME TO `user_roles`;--> statement-breakpoint
CREATE TABLE `__new_oauth_client_managers` (
	`client_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`client_id`, `user_id`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_oauth_client_managers`("client_id", "user_id") SELECT "client_id", "user_id" FROM `oauth_client_managers`;--> statement-breakpoint
DROP TABLE `oauth_client_managers`;--> statement-breakpoint
ALTER TABLE `__new_oauth_client_managers` RENAME TO `oauth_client_managers`;--> statement-breakpoint
CREATE TABLE `__new_oauth_client_secrets` (
	`client_id` text NOT NULL,
	`secret` text NOT NULL,
	`description` text,
	`issued_by` text NOT NULL,
	`issued_at` integer NOT NULL,
	PRIMARY KEY(`client_id`, `secret`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
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
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_oauth_clients`("id", "name", "description", "logo_url", "owner_id") SELECT "id", "name", "description", "logo_url", "owner_id" FROM `oauth_clients`;--> statement-breakpoint
DROP TABLE `oauth_clients`;--> statement-breakpoint
ALTER TABLE `__new_oauth_clients` RENAME TO `oauth_clients`;--> statement-breakpoint
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
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_oauth_tokens`("id", "client_id", "user_id", "code", "code_expires_at", "code_used", "redirect_uri", "access_token", "access_token_expires_at") SELECT "id", "client_id", "user_id", "code", "code_expires_at", "code_used", "redirect_uri", "access_token", "access_token_expires_at" FROM `oauth_tokens`;--> statement-breakpoint
DROP TABLE `oauth_tokens`;--> statement-breakpoint
ALTER TABLE `__new_oauth_tokens` RENAME TO `oauth_tokens`;--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_tokens_code_unique` ON `oauth_tokens` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_tokens_access_token_unique` ON `oauth_tokens` (`access_token`);