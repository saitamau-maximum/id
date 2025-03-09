import { and, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	ISocialLink,
	ISocialLinkRepository,
} from "../../../repository/social-link";

export class CloudflareSocialLinkRepository implements ISocialLinkRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async getSocialLinksByUserId(
		userId: string,
	): Promise<Omit<ISocialLink, "userId">[]> {
		const res = await this.client.query.socialLinks.findMany({
			columns: {
				userId: false,
				providerId: true,
				url: true,
			},
			where: eq(schema.socialLinks.userId, userId),
		});

		if (!res) {
			throw new Error("Social services not found");
		}

		return res;
	}

	async createSocialLink(socialLinks: ISocialLink): Promise<void> {
		const res = await this.client
			.insert(schema.socialLinks)
			.values(socialLinks);
		if (!res) {
			throw new Error("Failed to create social link");
		}
	}

	async updateSocialLink(socialLink: ISocialLink): Promise<void> {
		const res = await this.client.update(schema.socialLinks).set(socialLink);
		if (!res) {
			throw new Error("Failed to update social link");
		}
	}

	async deleteSocialLink(userId: string, providerId: string): Promise<void> {
		const res = await this.client
			.delete(schema.socialLinks)
			.where(
				and(
					eq(schema.socialLinks.userId, userId),
					eq(schema.socialLinks.providerId, providerId),
				),
			);
		if (!res) {
			throw new Error("Failed to delete social link");
		}
	}
}
