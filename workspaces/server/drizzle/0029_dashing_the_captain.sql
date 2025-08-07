ALTER TABLE `oauth_tokens` ADD `oidc_nonce` text;--> statement-breakpoint
ALTER TABLE `oauth_tokens` ADD `oidc_auth_time` integer;