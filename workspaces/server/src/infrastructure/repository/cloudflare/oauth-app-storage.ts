import type { IOAuthAppStorageRepository } from "../../../repository/storage";

export class CloudflareOAuthAppRepository
	implements IOAuthAppStorageRepository
{
	private storage: R2Bucket;

	constructor(storage: R2Bucket) {
		this.storage = storage;
	}

	private generateAppIconKey(appIcon: string): string {
		return `oauth-app/${appIcon}/icon.png`;
	}

	async uploadAppIcon(blob: Blob, appIcon: string): Promise<void> {
		const key = this.generateAppIconKey(appIcon);
		const res = await this.storage.put(key, blob);
		if (!res) {
			throw new Error("Failed to upload profile image");
		}
	}

	async getAppIconURL(appIcon: string): Promise<ReadableStream> {
		const key = this.generateAppIconKey(appIcon);
		const res = await this.storage.get(key);
		if (!res) {
			throw new Error("Not found");
		}
		return res.body;
	}
}
