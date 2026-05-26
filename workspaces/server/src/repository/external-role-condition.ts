import type { OAuthProviderId } from "@idp/schema/entity/oauth-internal/oauth-provider";
import type { RoleId } from "@idp/schema/entity/role";

export interface ExternalRoleCondition {
	id: number;
	providerId: OAuthProviderId;
	// GitHub Team の slug、Discord Role の snowflake
	externalRoleId: string;
	// この条件が成立するために必要な IdP ロールの集合 (AND セマンティクス)。
	// 空集合は「常に true」を意味し、全ユーザーに付与される。
	requiredRoleIds: ReadonlySet<RoleId>;
}

export interface IExternalRoleConditionRepository {
	listAll(): Promise<ExternalRoleCondition[]>;
}
