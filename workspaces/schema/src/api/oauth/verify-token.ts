import * as v from "valibot";
import { Client } from "../../entity/oauth-external/client";
import { User } from "../../entity/user";

export const VerifyTokenSuccessResponse = v.object({
	valid: v.literal(true),
	client: v.object({
		id: Client.entries.id,
		name: Client.entries.name,
		description: Client.entries.description,
		logo_url: Client.entries.logoUrl,
		owner_id: Client.entries.ownerId,
	}),
	user_id: User.entries.id,
	expires_at: v.pipe(v.number(), v.minValue(0)),
	scopes: v.array(v.string()),
});
export type VerifyTokenSuccessResponse = v.InferOutput<
	typeof VerifyTokenSuccessResponse
>;

export const VerifyTokenFailureResponse = v.object({
	valid: v.literal(false),
	client: v.null(),
	user_id: v.null(),
	expires_at: v.null(),
	scopes: v.null(),
});
export type VerifyTokenFailureResponse = v.InferOutput<
	typeof VerifyTokenFailureResponse
>;

export const VerifyTokenResponse = v.union([
	VerifyTokenSuccessResponse,
	VerifyTokenFailureResponse,
]);
export type VerifyTokenResponse = v.InferOutput<typeof VerifyTokenResponse>;
