import type { Contributions } from "@idp/schema/entity/contribution";
import type { IContributionCacheRepository } from "../../../repository/cache";

export class CloudflareContributionCacheRepository
	implements IContributionCacheRepository
{
	constructor(private readonly kv: KVNamespace) {}

	private generateKey(username: string): string {
		return `contribution:${username}`;
	}

	async get(username: string): Promise<Contributions | null> {
		const res = await this.kv.get<Contributions>(
			this.generateKey(username),
			"json",
		);
		if (res === null) {
			return null;
		}
		return res;
	}

	async set(username: string, value: Contributions): Promise<void> {
		await this.kv.put(this.generateKey(username), JSON.stringify(value), {
			expirationTtl: 60 * 60, // 1 hour
		});
	}
}
