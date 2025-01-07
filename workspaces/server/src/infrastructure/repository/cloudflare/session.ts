import type { ISessionRepository } from "../../../usecase/repository/session";

export class CloudflareSessionRepository implements ISessionRepository {
	constructor(private readonly kv: KVNamespace) {}

	async storeOneTimeToken(
		token: string,
		payload: string,
		ttl: number,
	): Promise<void> {
		await this.kv.put(token, payload, { expirationTtl: ttl });
	}

	async verifyOneTimeToken(token: string): Promise<string | null> {
		return this.kv.get(token, "text");
	}
}
