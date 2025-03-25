PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer,
	`remaining_use` integer,
	`created_at` integer NOT NULL,
	`issued_by` text NOT NULL,
	FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_invites`("id", "expires_at", "remaining_use", "created_at", "issued_by") SELECT "id", "expires_at", "remaining_use", "created_at", "issued_by" FROM `invites`;--> statement-breakpoint
DROP TABLE `invites`;--> statement-breakpoint
ALTER TABLE `__new_invites` RENAME TO `invites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `issued_by_idx` ON `invites` (`issued_by`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `invites` (`created_at`);