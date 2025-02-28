import { isScopeId } from "node_modules/@idp/server/dist/constants/scope";
import * as v from "valibot";

export const OAuthSchemas = {
	ApplicationName: v.pipe(
		v.string(),
		v.nonEmpty("アプリケーション名を入力してください"),
		v.minLength(3, "アプリケーション名は3文字以上16文字以下で入力してください"),
		v.maxLength(
			16,
			"アプリケーション名は3文字以上16文字以下で入力してください",
		),
	),
	Description: v.pipe(
		v.string(),
		v.maxLength(255, "説明は255文字以下で入力してください"),
	),
	ScopeIds: v.pipe(
		v.array(
			v.pipe(
				v.string(),
				v.check(
					(input) => isScopeId(Number(input)),
					"存在しないスコープが含まれています",
				),
			),
		),
		v.minLength(1, "スコープを選択してください"),
	),
	CallbackUrls: v.pipe(
		v.array(
			v.object({
				value: v.pipe(v.string(), v.url("URL が正しくありません")),
			}),
		),
		v.minLength(1, "コールバック URL を入力してください"),
	),
	// input[type=file] は、何も選択していない場合は空の FileList が返る
	Icon: v.pipe(
		v.custom<FileList>(
			// filelistには実体がないので v.instance に引数として渡すことができない
			(input) => input instanceof FileList,
			"アイコンを選択してください",
		),
		v.check((input) => input.length <= 1),
		v.check(
			(input) => input.length === 0 || input[0].type.startsWith("image/"),
		),
		v.check((input) => input.length === 0 || input[0].size < 1024 * 1024 * 5), // 5MiB
	),
};
