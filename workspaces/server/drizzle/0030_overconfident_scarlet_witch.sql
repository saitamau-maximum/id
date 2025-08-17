ALTER TABLE `oauth_tokens` ADD `oidc_nonce` text;--> statement-breakpoint
ALTER TABLE `oauth_tokens` ADD `oidc_auth_time` integer;--> statement-breakpoint
CREATE INDEX `oauth_tokens_access_token_expires_at_idx` ON `oauth_tokens` (`access_token_expires_at`);--> statement-breakpoint
CREATE INDEX `oauth_tokens_code_expires_at_idx` ON `oauth_tokens` (`code_expires_at`);