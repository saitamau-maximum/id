CREATE TABLE `invite_roles` (
	`invite_id` text NOT NULL,
	`role_id` integer NOT NULL,
	PRIMARY KEY(`invite_id`, `role_id`),
	FOREIGN KEY (`invite_id`) REFERENCES `invites`(`id`) ON UPDATE no action ON DELETE no action
);
