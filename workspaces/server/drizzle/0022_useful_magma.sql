-- 新規・既存ユーザーに対して DEFAULT 1 とする
ALTER TABLE `users` ADD `is_pending` integer NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` ADD `invitation_id` text REFERENCES invites(id);--> statement-breakpoint

-- 既存ユーザーについては is_pending = 0 とする
UPDATE `users` SET `is_pending` = 0;
