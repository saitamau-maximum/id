PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text,
	`real_name` text,
	`real_name_kana` text,
	`display_id` text,
	`profile_image_url` text,
	`academic_email` text,
	`email` text,
	`student_id` text,
	`grade` integer,
	`faculty` integer,
	`department` integer,
	`laboratory` text,
	`graduate_school` text,
	`specialization` text,
	`bio` text,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- INSERT INTO `__new_user_profiles`("id", "user_id", "display_name", "real_name", "real_name_kana", "display_id", "profile_image_url", "academic_email", "email", "student_id", "grade", "faculty", "department", "laboratory", "graduate_school", "specialization", "bio", "updated_at") SELECT "id", "user_id", "display_name", "real_name", "real_name_kana", "display_id", "profile_image_url", "academic_email", "email", "student_id", "grade", "faculty", "department", "laboratory", "graduate_school", "specialization", "bio", "updated_at" FROM `user_profiles`;--> statement-breakpoint

---------- custom migration ----------
-- まずは対象外の値をそのままコピー
INSERT INTO `__new_user_profiles`("id", "user_id", "display_name", "real_name", "real_name_kana", "display_id", "profile_image_url", "academic_email", "email", "student_id", "laboratory", "graduate_school", "specialization", "bio", "updated_at") SELECT "id", "user_id", "display_name", "real_name", "real_name_kana", "display_id", "profile_image_url", "academic_email", "email", "student_id", "laboratory", "graduate_school", "specialization", "bio", "updated_at" FROM `user_profiles`;--> statement-breakpoint

-- grade を text から integer にする
UPDATE `__new_user_profiles` SET grade = CASE user_profiles.grade
	WHEN 'B1' THEN 1
	WHEN 'B2' THEN 2
	WHEN 'B3' THEN 3
	WHEN 'B4' THEN 4
	WHEN 'M1' THEN 5
	WHEN 'M2' THEN 6
	WHEN 'D1' THEN 7
	WHEN 'D2' THEN 8
	WHEN 'D3' THEN 9
	WHEN '卒業生' THEN 10
	WHEN 'ゲスト' THEN 11
	ELSE NULL
END
FROM `user_profiles`
WHERE `__new_user_profiles`.id = `user_profiles`.id;--> statement-breakpoint

-- faculty を text から integer にする
UPDATE `__new_user_profiles` SET faculty = CASE user_profiles.faculty
	WHEN '教養学部' THEN 1
	WHEN '経済学部' THEN 2
	WHEN '教育学部' THEN 3
	WHEN '理学部' THEN 4
	WHEN '工学部' THEN 5
END
FROM `user_profiles`
WHERE `__new_user_profiles`.id = `user_profiles`.id;--> statement-breakpoint

-- department を text から integer にする
UPDATE `__new_user_profiles` SET department = CASE user_profiles.department
  WHEN 'グローバル・ガバナンス専修課程' THEN 101
	WHEN '現代社会専修課程' THEN 102
	WHEN '哲学歴史専修課程' THEN 103
	WHEN 'ヨーロッパ・アメリカ文化専修課程' THEN 104
	WHEN '日本・アジア文化専修課程' THEN 105
  WHEN '共生構想専修課程' THEN 106
	WHEN '小学校コース' THEN 301
	WHEN '中学校コース' THEN 302
	WHEN '乳幼児教育コース' THEN 303
	WHEN '特別支援教育コース' THEN 304
	WHEN '養護教諭養成課程' THEN 305
	WHEN '数学科' THEN 401
	WHEN '物理学科' THEN 402
	-- 正しくは「化学」だが変更前が「科学」になっていたのでマイグレーションは「科学」にする
	WHEN '基礎科学科' THEN 403
	WHEN '分子生物学科' THEN 404
	WHEN '生体制御学科' THEN 405
	WHEN '機械工学・システムデザイン学科' THEN 501
	WHEN '電気電子物理工学科' THEN 502
	WHEN '情報工学科' THEN 503
	WHEN '応用科学科' THEN 504 -- 同上
	WHEN '環境社会デザイン学科' THEN 505
END
FROM `user_profiles`
WHERE `__new_user_profiles`.id = `user_profiles`.id;--> statement-breakpoint

---------- custom migration end ----------

DROP TABLE `user_profiles`;--> statement-breakpoint
ALTER TABLE `__new_user_profiles` RENAME TO `user_profiles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `grade_idx` ON `user_profiles` (`grade`);--> statement-breakpoint
CREATE UNIQUE INDEX `display_id_unique` ON `user_profiles` (`display_id`);