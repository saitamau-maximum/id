PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_certifications` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_certifications`("id", "title", "description") SELECT "id", "title", "description" FROM `certifications`;--> statement-breakpoint
DROP TABLE `certifications`;--> statement-breakpoint
ALTER TABLE `__new_certifications` RENAME TO `certifications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `certifications_title_unique` ON `certifications` (`title`);