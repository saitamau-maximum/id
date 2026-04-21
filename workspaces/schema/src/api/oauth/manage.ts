import * as v from "valibot";
import { RHFableArray } from "../../common/rhf-array";
import {
	Client,
	ClientCallback,
	ExportableClientSecret,
} from "../../entity/oauth-external/client";
import { Scope, ScopeId } from "../../entity/oauth-external/scope";
import { UserBasicInfo } from "../../entity/user";

export const OAuthAppGetListResponse = v.array(
	v.intersect([
		Client,
		v.object({
			managers: v.array(UserBasicInfo),
			owner: UserBasicInfo,
		}),
	]),
);
export type OAuthAppGetListResponse = v.InferOutput<
	typeof OAuthAppGetListResponse
>;

export const OAuthAppGetClientByIdResponse = v.intersect([
	Client,
	v.object({
		callbackUrls: v.array(ClientCallback.entries.callbackUrl),
		scopes: v.array(Scope),
		managers: v.array(UserBasicInfo),
		owner: UserBasicInfo,
		secrets: v.array(ExportableClientSecret),
	}),
]);
export type OAuthAppGetClientByIdResponse = v.InferOutput<
	typeof OAuthAppGetClientByIdResponse
>;

export const OAuthAppRegisterParams = v.object({
	name: v.pipe(
		v.string(),
		v.nonEmpty("アプリ名は必須です"),
		v.minLength(3, "アプリ名は3文字以上で入力してください"),
		v.maxLength(16, "アプリ名は16文字以下で入力してください"),
	),
	description: v.pipe(
		v.string(),
		v.maxLength(255, "説明は255文字以下で入力してください"),
	),
	scopeIds: v.pipe(
		v.array(
			v.pipe(
				v.string(),
				v.toNumber(),
				v.custom<ScopeId>(
					(input) => v.is(ScopeId, input),
					"存在しないスコープが含まれています",
				),
			),
		),
		v.minLength(1, "スコープを選択してください"),
	),
	callbackUrls: RHFableArray(
		v.pipe(
			v.string(),
			// encodeURIComponent でエンコードされた URL を受け取るので、バリデーションの前にデコードする
			v.transform((input) => decodeURIComponent(input)),
			v.url("URL が正しくありません"),
			v.check((input) => {
				// server/src/routes/oauth/authorize.ts で正規化される
				// それに合わせて search を入れないようにする
				const url = new URL(input);
				return url.search === "";
			}, "登録される URL にはクエリパラメータを含めることはできません。 OAuth Flow での redirect_uri で指定してください。"),
			v.check((input) => {
				// fragment component を含まないこと
				const url = new URL(input);
				return url.hash === "";
			}, "登録される URL にはフラグメントを含めることはできません。"),
			v.check((input) => {
				// 絶対 URL であること
				return URL.canParse(input);
			}, "登録される URL は絶対 URL でなければなりません。"),
		),
	),
	icon: v.optional(
		v.pipe(
			v.file("アイコンを選択してください"),
			v.maxSize(1024 * 1024 * 5, "アイコンは5MB以下で選択してください"),
		),
	),
});
export type OAuthAppRegisterParams = v.InferOutput<
	typeof OAuthAppRegisterParams
>;

export const OAuthAppGenerateSecretResponse = v.object({
	secret: v.string(),
	secretHash: v.string(),
});
export type OAuthAppGenerateSecretResponse = v.InferOutput<
	typeof OAuthAppGenerateSecretResponse
>;
