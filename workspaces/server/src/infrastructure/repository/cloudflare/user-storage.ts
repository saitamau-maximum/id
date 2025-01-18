import type { IUserStorageRepository } from "../../../repository/storage";

export class CloudflareUserStorageRepository implements IUserStorageRepository {
	private storage: R2Bucket;

	constructor(storage: R2Bucket) {
		this.storage = storage;
	}

	private generateKey(userId: string): string {
		return `avatar/${userId}.png`;
	}

	async uploadProfileImage(blob: Blob, userId: string): Promise<void> {
		const key = this.generateKey(userId);
		const res = await this.storage.put(key, blob);
		if (!res) {
			throw new Error("Failed to upload profile image");
		}
	}

	async getProfileImageURL(userId: string): Promise<ReadableStream> {
		const key = this.generateKey(userId);
		const res = await this.storage.get(key);
		if (!res) {
			throw new Error("Not found");
		}
		return res.body;
	}
}
