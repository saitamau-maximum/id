CREATE TABLE `invite_roles` (
	`invite_id` text NOT NULL,
	`role_id` integer NOT NULL,
	PRIMARY KEY(`invite_id`, `role_id`),
	FOREIGN KEY (`invite_id`) REFERENCES `invites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invites` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer,
	`remaining_use` integer,
	`created_at` integer NOT NULL,
	`issued_by` text NOT NULL,
	FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
