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
