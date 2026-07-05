CREATE TABLE `external_role_condition_requirements` (
	`condition_id` integer NOT NULL,
	`required_role_id` integer NOT NULL,
	PRIMARY KEY(`condition_id`, `required_role_id`),
	FOREIGN KEY (`condition_id`) REFERENCES `external_role_conditions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `external_role_conditions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`external_role_id` integer NOT NULL,
	`requirement_count` integer NOT NULL,
	`requirement_signature` text NOT NULL,
	FOREIGN KEY (`external_role_id`) REFERENCES `external_roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `external_role_conditions_dedup` ON `external_role_conditions` (`external_role_id`,`requirement_signature`);--> statement-breakpoint
CREATE INDEX `external_role_conditions_role_idx` ON `external_role_conditions` (`external_role_id`);--> statement-breakpoint
CREATE TABLE `external_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer NOT NULL,
	`role_id` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `external_roles_provider_role_unique` ON `external_roles` (`provider_id`,`role_id`);
--> statement-breakpoint
CREATE TABLE `external_user_roles` (
	`user_id` text NOT NULL,
	`role_id` integer NOT NULL,
	`state` text,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `external_roles`(`id`) ON UPDATE no action ON DELETE no action
);