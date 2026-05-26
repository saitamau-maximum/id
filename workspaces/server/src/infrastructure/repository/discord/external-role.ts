import type { IDiscordBotRepository } from "../../../repository/discord-bot";
import type { IExternalRoleProviderRepository } from "../../../repository/external-role-provider";

export class DiscordExternalRoleProviderRepository
	implements IExternalRoleProviderRepository
{
	constructor(private readonly discordBotRepo: IDiscordBotRepository) {}

	async fetchUserRoles(
		snowflake: string,
		candidates: ReadonlySet<string>,
	): Promise<Set<string>> {
		const member = await this.discordBotRepo.getGuildMember(snowflake);
		if (member === null) {
			// メンバーがサーバーにいない場合は空集合
			return new Set();
		}
		return new Set(member.roles.filter((r) => candidates.has(r)));
	}

	async assignRole(snowflake: string, roleId: string): Promise<void> {
		await this.discordBotRepo.assignGuildMemberRole(snowflake, roleId);
	}

	async removeRole(snowflake: string, roleId: string): Promise<void> {
		await this.discordBotRepo.removeGuildMemberRole(snowflake, roleId);
	}
}
