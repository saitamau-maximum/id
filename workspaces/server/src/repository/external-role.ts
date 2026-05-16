import type { ExternalRole } from "@idp/schema/entity/external-role";
import type { OAuthProviderId } from "@idp/schema/entity/oauth-internal/oauth-provider";

export type ExternalRoleUpsertParams = Pick<
	ExternalRole,
	"providerId" | "externalRoleId" | "name"
>;

export interface IExternalRoleRepository {
	listAll(): Promise<ExternalRole[]>;
	listByProvider(providerId: OAuthProviderId): Promise<ExternalRole[]>;
	getById(id: number): Promise<ExternalRole | null>;
	// provider から取得した最新一覧で external_roles を置き換える。
	// keepExternalRoleIds に含まれない provider の既存行は削除される。
	// 返り値は upsert/insert 後の全行。
	replaceProviderRoles(
		providerId: OAuthProviderId,
		roles: Omit<ExternalRoleUpsertParams, "providerId">[],
		fetchedAt: Date,
	): Promise<ExternalRole[]>;
}
