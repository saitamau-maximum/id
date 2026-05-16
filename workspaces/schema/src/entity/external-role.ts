import * as v from "valibot";
import { OAuthProviderId } from "./oauth-internal/oauth-provider";
import { RoleId } from "./role";

export const ExternalRole = v.object({
	id: v.number(),
	providerId: OAuthProviderId,
	externalRoleId: v.string(),
	name: v.string(),
	lastFetchedAt: v.date(),
});

export type ExternalRole = v.InferOutput<typeof ExternalRole>;

export const ExternalRoleGrantCondition = v.object({
	externalRoleId: ExternalRole.entries.id,
	requiredRoleId: RoleId,
});

export type ExternalRoleGrantCondition = v.InferOutput<
	typeof ExternalRoleGrantCondition
>;
