-- Custom SQL migration file, put your code below! --
INSERT OR IGNORE INTO `oauth_providers` (`id`, `name`) VALUES (1, "GitHub");
INSERT OR IGNORE INTO `oauth_scopes` (`id`, `name`, `description`) VALUES (1, "read:basic_info", "あなたのユーザー名やユーザー ID、プロフィール画像を読み取ります。");
