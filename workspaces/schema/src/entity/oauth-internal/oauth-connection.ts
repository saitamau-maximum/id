import * as v from "valibot";
import { OAuthProviderId } from "./oauth-provider";

export const OAuthConnection = v.object({
	userId: v.string(),
	providerId: OAuthProviderId,
	providerUserId: v.string(),
	refreshToken: v.nullable(v.string()),
	refreshTokenExpiresAt: v.nullable(v.date()),
	email: v.nullable(v.string()),
	name: v.nullable(v.string()),
	profileImageUrl: v.nullable(v.string()),
});

export type OAuthConnection = v.InferOutput<typeof OAuthConnection>;

/**
 * 別メンバー含むユーザーに渡しても問題ない情報
 */
export const ExportableOAuthConnection = v.pick(OAuthConnection, [
	"providerId",
	"providerUserId",
	"name",
	"profileImageUrl",
]);

export type ExportableOAuthConnection = v.InferOutput<
	typeof ExportableOAuthConnection
>;
