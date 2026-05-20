ALTER TABLE `oauth_client_secrets` ADD `secret_hash` text;--> statement-breakpoint
ALTER TABLE `oauth_client_secrets` ADD `secret_suffix` text;--> statement-breakpoint
ALTER TABLE `oauth_tokens` ADD `code_challenge` text;--> statement-breakpoint
ALTER TABLE `oauth_tokens` ADD `code_challenge_method` text;
