import {
	type RESTGetAPIGuildMemberResult,
	type RESTGetAPIGuildRolesResult,
	RouteBases,
	Routes,
} from "discord-api-types/v10";
import type {
	FetchedExternalRole,
	IExternalRoleProviderRepository,
} from "../../../repository/external-role-provider";

export class DiscordExternalRoleProviderRepository
	implements IExternalRoleProviderRepository
{
	constructor(
		private readonly botToken: string,
		private readonly guildId: string,
	) {}

	private async fetchApi(path: string, init?: RequestInit) {
		return await fetch(RouteBases.api + path, {
			...init,
			headers: {
				Authorization: `Bot ${this.botToken}`,
				"Content-Type": "application/json",
				...init?.headers,
			},
		});
	}

	async fetchAvailableRoles(): Promise<FetchedExternalRole[]> {
		const res = await this.fetchApi(Routes.guildRoles(this.guildId));
		if (!res.ok) {
			throw new Error(
				`Failed to fetch Discord guild roles: ${res.status} ${res.statusText}`,
			);
		}

		const roles = await res.json<RESTGetAPIGuildRolesResult>();

		return roles
			.filter((role) => {
				// @everyone は guild id と同じ id を持ち、明示的に付与/剥奪できない
				if (role.id === this.guildId) return false;
				// Bot や integration が管理するロールは API で付け外しできないので除外
				if (role.managed) return false;
				return true;
			})
			.map((role) => ({
				externalRoleId: role.id,
				name: role.name,
			}));
	}

	async fetchUserRoles(
		snowflake: string,
		candidates: ReadonlySet<string>,
	): Promise<Set<string>> {
		const res = await this.fetchApi(
			Routes.guildMember(this.guildId, snowflake),
		);
		if (res.status === 404) {
			// メンバーがサーバーにいない場合は空集合 (sync 側で「持つべき」が空にならない
			// なら add が試みられ、それも失敗するので結果的にエラーログが出る)
			return new Set();
		}
		if (!res.ok) {
			throw new Error(
				`Failed to fetch Discord guild member ${snowflake}: ${res.status} ${res.statusText}`,
			);
		}
		const member = await res.json<RESTGetAPIGuildMemberResult>();
		return new Set(member.roles.filter((r) => candidates.has(r)));
	}

	async assignRole(snowflake: string, roleId: string): Promise<void> {
		const res = await this.fetchApi(
			Routes.guildMemberRole(this.guildId, snowflake, roleId),
			{ method: "PUT" },
		);
		if (!res.ok) {
			throw new Error(
				`Failed to assign Discord role ${roleId} to ${snowflake}: ${res.status} ${res.statusText}`,
			);
		}
	}

	async removeRole(snowflake: string, roleId: string): Promise<void> {
		const res = await this.fetchApi(
			Routes.guildMemberRole(this.guildId, snowflake, roleId),
			{ method: "DELETE" },
		);
		if (!res.ok) {
			throw new Error(
				`Failed to remove Discord role ${roleId} from ${snowflake}: ${res.status} ${res.statusText}`,
			);
		}
	}
}
