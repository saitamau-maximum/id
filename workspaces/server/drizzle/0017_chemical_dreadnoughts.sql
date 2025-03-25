CREATE TABLE `invites` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`remaining_use` integer NOT NULL,
	`created_at` integer NOT NULL,
	`issued_by` text NOT NULL,
	`access_token` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `issued_by_idx` ON `invites` (`issued_by`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `invites` (`created_at`);