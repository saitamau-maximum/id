CREATE TABLE `certification_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `certification_definitions_title_unique` ON `certification_definitions` (`title`);--> statement-breakpoint
CREATE TABLE `certifications` (
	`user_id` text NOT NULL,
	`cert_def_id` text NOT NULL,
	`certified_in` integer NOT NULL,
	PRIMARY KEY(`user_id`, `cert_def_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cert_def_id`) REFERENCES `certification_definitions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_certifiedat_idx` ON `certifications` (`user_id`,`certified_in`);