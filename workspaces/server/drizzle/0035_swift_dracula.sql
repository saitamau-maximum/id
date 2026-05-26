CREATE TABLE `external_role_condition_requirements` (
	`condition_id` integer NOT NULL,
	`required_role_id` integer NOT NULL,
	PRIMARY KEY(`condition_id`, `required_role_id`),
	FOREIGN KEY (`condition_id`) REFERENCES `external_role_conditions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `external_role_conditions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer NOT NULL,
	`external_role_id` text NOT NULL,
	`requirement_count` integer NOT NULL,
	`requirement_signature` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `external_role_conditions_dedup` ON `external_role_conditions` (`provider_id`,`external_role_id`,`requirement_signature`);--> statement-breakpoint
CREATE INDEX `external_role_conditions_provider_idx` ON `external_role_conditions` (`provider_id`);