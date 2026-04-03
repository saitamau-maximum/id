import * as v from "valibot";
import { User } from "../user";
import { ScopeId } from "./scope";

export const Client = v.object({
	id: v.string(),
	name: v.string(),
	description: v.nullable(v.string()),
	logoUrl: v.nullable(v.pipe(v.string(), v.url())),
	ownerId: User.entries.id,
});
export type Client = v.InferOutput<typeof Client>;

export const ClientSecret = v.object({
	clientId: Client.entries.id,
	secret: v.string(),
	description: v.nullable(v.string()),
	issuedBy: User.entries.id,
	issuedAt: v.date(),
});
export type ClientSecret = v.InferOutput<typeof ClientSecret>;

/**
 * IdP フロントエンドで公開しても問題ない情報
 *
 * - secret は一部マスク済み (ref: server/src/routes/oauth/manage.ts)
 * - マスクすると一意に識別できない可能性があるので、 Hash も一緒に返している
 */
export const ExportableClientSecret = v.object({
	secretHash: v.string(),
	...v.pick(ClientSecret, ["secret", "description", "issuedBy", "issuedAt"])
		.entries,
});
export type ExportableClientSecret = v.InferOutput<
	typeof ExportableClientSecret
>;

export const ClientCallback = v.object({
	clientId: Client.entries.id,
	callbackUrl: v.pipe(v.string(), v.url()),
});
export type ClientCallback = v.InferOutput<typeof ClientCallback>;

export const ClientScope = v.object({
	clientId: Client.entries.id,
	scopeId: ScopeId,
});
export type ClientScope = v.InferOutput<typeof ClientScope>;

export const ClientToken = v.object({
	id: v.number(),
	clientId: Client.entries.id,
	userId: User.entries.id,
	code: v.string(),
	codeExpiresAt: v.date(),
	codeUsed: v.boolean(),
	redirectUri: v.nullable(v.pipe(v.string(), v.url())),
	accessToken: v.string(),
	accessTokenExpiresAt: v.date(),
});
export type ClientToken = v.InferOutput<typeof ClientToken>;
