import * as v from "valibot";
import {
	Client,
	ClientCallback,
	ExportableClientSecret,
} from "../../entity/oauth-external/client";
import { Scope, ScopeId } from "../../entity/oauth-external/scope";
import { UserBasicInfo } from "../../entity/user";

export const OAuthAppGetListResponse = v.array(
	v.object({
		...Client.entries,
		managers: v.array(UserBasicInfo),
		owner: UserBasicInfo,
	}),
);
export type OAuthAppGetListResponse = v.InferOutput<
	typeof OAuthAppGetListResponse
>;

export const OAuthAppGetClientByIdResponse = v.object({
	...Client.entries,
	callbackUrls: v.array(ClientCallback.entries.callbackUrl),
	scopes: v.array(Scope),
	managers: v.array(UserBasicInfo),
	owner: UserBasicInfo,
	secrets: v.array(ExportableClientSecret),
});
export type OAuthAppGetClientByIdResponse = v.InferOutput<
	typeof OAuthAppGetClientByIdResponse
>;

export const OAuthAppRegisterParams = v.object({
	name: v.pipe(v.string(), v.nonEmpty("アプリ名は必須です")),
	description: v.string(),
	// formなので配列はカンマ区切りの文字列として受け取る
	scopeIds: v.pipe(
		v.string(),
		v.transform((input) => input.split(",")),
		v.array(
			v.pipe(
				v.string(),
				v.toNumber(),
				v.custom<ScopeId>((input) => v.is(ScopeId, input)),
			),
		),
	),
	callbackUrls: v.pipe(
		v.string(),
		v.transform((input) => input.split(",").map(decodeURIComponent)),
		v.array(
			v.pipe(
				v.string(),
				v.url(),
				v.custom((input) => {
					if (typeof input !== "string") return false;
					// 絶対 URL であること
					if (!URL.canParse(input)) return false;
					// fragment component を含まないこと
					const url = new URL(input);
					return url.hash === "";
				}),
			),
		),
	),
	icon: v.optional(v.pipe(v.file(), v.maxSize(1024 * 1024 * 5))), // 5MiB
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
