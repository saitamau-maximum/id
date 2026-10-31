PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_oauth_client_secrets` (
	`client_id` text NOT NULL,
	`secret` text NOT NULL,
	`secret_suffix` text NOT NULL,
	`description` text,
	`issued_by` text NOT NULL,
	`issued_at` integer NOT NULL,
	PRIMARY KEY(`client_id`, `secret`),
	FOREIGN KEY (`client_id`) REFERENCES `oauth_clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_oauth_client_secrets`("client_id", "secret", "secret_suffix", "description", "issued_by", "issued_at") SELECT "client_id", "secret", "secret_suffix", "description", "issued_by", "issued_at" FROM `oauth_client_secrets`;--> statement-breakpoint
DROP TABLE `oauth_client_secrets`;--> statement-breakpoint
ALTER TABLE `__new_oauth_client_secrets` RENAME TO `oauth_client_secrets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;