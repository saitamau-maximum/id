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
				value: v.pipe(
					v.string(),
					v.url("URL が正しくありません"),
					v.custom((input) => {
						// server/src/routes/oauth/authorize.ts で正規化される
						// それに合わせて search を入れないようにする
						if (typeof input !== "string") return false;
						const url = new URL(input);
						return url.search === "";
					}, "登録される URL にはクエリパラメータを含めることはできません。 OAuth Flow での redirect_uri で指定してください。"),
				),
			}),
		),
		v.minLength(1, "コールバック URL を入力してください"),
	),
	Icon: v.optional(
		v.pipe(
			v.file("アイコンを選択してください"),
			v.maxSize(1024 * 1024 * 5, "アイコンは5MB以下で選択してください"),
		),
	),
};
