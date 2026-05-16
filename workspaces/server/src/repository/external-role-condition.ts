import type { ExternalRoleGrantCondition } from "@idp/schema/entity/external-role";
import type { RoleId } from "@idp/schema/entity/role";

export interface IExternalRoleConditionRepository {
	listAll(): Promise<ExternalRoleGrantCondition[]>;
	listByExternalRoleId(
		externalRoleId: number,
	): Promise<ExternalRoleGrantCondition[]>;
	// 指定された external_role の付与条件 (required_role_id の集合) を完全に置き換える。
	setForExternalRole(
		externalRoleId: number,
		requiredRoleIds: RoleId[],
	): Promise<void>;
}
