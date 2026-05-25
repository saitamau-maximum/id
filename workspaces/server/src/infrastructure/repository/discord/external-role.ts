import {
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

	async fetchAvailableRoles(): Promise<FetchedExternalRole[]> {
		const res = await fetch(RouteBases.api + Routes.guildRoles(this.guildId), {
			headers: {
				Authorization: `Bot ${this.botToken}`,
				"Content-Type": "application/json",
			},
		});

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
}
