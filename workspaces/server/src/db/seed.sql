-- 投入されるべきデータをここに書く

INSERT OR IGNORE INTO `oauth_provider` (`id`, `name`) VALUES (1, "GitHub")

INSERT OR IGNORE INTO `oauth_scope` (`id`, `name`, `description`) VALUES (1, "read:basic_info", "あなたのユーザー名やユーザー ID、プロフィール画像を読み取ります。")
