ALTER TABLE users RENAME TO old_users;

CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `initialized_at` integer,
  `is_pending` integer NOT NULL DEFAULT 1,  -- 新規ユーザーのデフォルト値は 1 にする
  `invitation_id` text
);

-- 既存ユーザーについては is_pending = 0 とする
INSERT INTO `users` ("id", "initialized_at", "is_pending") SELECT "id", "initialized_at", COALESCE("is_pending", 0) FROM old_users;

DROP TABLE old_users;--> statement-breakpoint
