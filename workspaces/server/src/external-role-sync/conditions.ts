import {
	OAUTH_PROVIDER_IDS,
	type OAuthProviderId,
} from "@idp/schema/entity/oauth-internal/oauth-provider";
import { ROLE_IDS, type RoleId } from "@idp/schema/entity/role";

export interface ConditionDef {
	providerId: OAuthProviderId;
	// GitHub Team は slug、Discord Role は snowflake
	externalRoleId: string;
	// AND セマンティクス。同じ (providerId, externalRoleId) に複数エントリ → OR
	requiredRoleIds: RoleId[];
}

export const CONDITIONS: ConditionDef[] = [
	// ----- GitHub Org Teams -----
	{
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		externalRoleId: "dev",
		requiredRoleIds: [ROLE_IDS.DEV],
	},
	{
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		externalRoleId: "cp",
		requiredRoleIds: [ROLE_IDS.CP],
	},
	{
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		externalRoleId: "web",
		requiredRoleIds: [ROLE_IDS.WEB],
	},
	{
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		externalRoleId: "ai",
		requiredRoleIds: [ROLE_IDS.AI],
	},
	{
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		externalRoleId: "ctf",
		requiredRoleIds: [ROLE_IDS.CTF],
	},
	{
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		externalRoleId: "animation",
		requiredRoleIds: [ROLE_IDS.ANIMATION],
	},
	{
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		externalRoleId: "game",
		requiredRoleIds: [ROLE_IDS.GAME],
	},
	{
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		externalRoleId: "infra",
		requiredRoleIds: [ROLE_IDS.INFRA],
	},

	// ----- Discord Guild Roles (snowflake) -----
	// { providerId: OAUTH_PROVIDER_IDS.DISCORD, externalRoleId: "snowflake", requiredRoleIds: [ROLE_IDS.DEV] },
];
