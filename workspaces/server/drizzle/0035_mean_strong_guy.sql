CREATE TABLE `point_services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`token` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `point_services_name_unique` ON `point_services` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `point_services_token_unique` ON `point_services` (`token`);--> statement-breakpoint
CREATE TABLE `point_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`from_user_id` text,
	`to_user_id` text,
	`amount` integer NOT NULL,
	`service_id` text,
	`description` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `point_services`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "amount_positive" CHECK("point_transactions"."amount" > 0),
	CONSTRAINT "from_to_different" CHECK("point_transactions"."from_user_id" != "point_transactions"."to_user_id")
);
--> statement-breakpoint
CREATE INDEX `from_user_idx` ON `point_transactions` (`from_user_id`);--> statement-breakpoint
CREATE INDEX `to_user_idx` ON `point_transactions` (`to_user_id`);--> statement-breakpoint
CREATE TABLE `points` (
	`user_id` text PRIMARY KEY NOT NULL,
	`balance` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "balance_non_negative" CHECK("points"."balance" >= 0)
);
--> statement-breakpoint
CREATE INDEX `balance_idx` ON `points` (`balance`);