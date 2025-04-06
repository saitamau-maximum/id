CREATE TABLE `certifications` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `certifications_title_unique` ON `certifications` (`title`);--> statement-breakpoint
CREATE TABLE `user_certifications` (
	`user_id` text NOT NULL,
	`certification_id` text NOT NULL,
	`certified_in` integer NOT NULL,
	PRIMARY KEY(`user_id`, `certification_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`certification_id`) REFERENCES `certifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_certifiedat_idx` ON `user_certifications` (`user_id`,`certified_in`);