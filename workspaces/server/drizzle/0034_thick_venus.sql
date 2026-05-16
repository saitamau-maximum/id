CREATE TABLE `external_role_grant_conditions` (
	`external_role_id` integer NOT NULL,
	`required_role_id` integer NOT NULL,
	PRIMARY KEY(`external_role_id`, `required_role_id`),
	FOREIGN KEY (`external_role_id`) REFERENCES `external_roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `external_role_grant_conditions_required_role_idx` ON `external_role_grant_conditions` (`required_role_id`);--> statement-breakpoint
CREATE TABLE `external_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer NOT NULL,
	`external_role_id` text NOT NULL,
	`name` text NOT NULL,
	`last_fetched_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `external_roles_provider_role_unique` ON `external_roles` (`provider_id`,`external_role_id`);