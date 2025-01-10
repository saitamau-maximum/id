import type { IContributionCacheRepository } from "../../../usecase/repository/cache";
import type { Contribitions } from "../../../usecase/repository/contribution";

export class CloudflareContributionCacheRepository
	implements IContributionCacheRepository
{
	constructor(private readonly kv: KVNamespace) {}

	private generateKey(username: string): string {
		return `contribution:${username}`;
	}

	async get(username: string): Promise<Contribitions | null> {
		const res = await this.kv.get<Contribitions>(
			this.generateKey(username),
			"json",
		);
		if (res === null) {
			return null;
		}
		return res;
	}

	async set(username: string, value: Contribitions): Promise<void> {
		await this.kv.put(this.generateKey(username), JSON.stringify(value), {
			expirationTtl: 60 * 60, // 1 hour
		});
	}
}
