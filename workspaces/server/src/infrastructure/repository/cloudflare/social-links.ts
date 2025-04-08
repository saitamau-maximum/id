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
	): Promise<ISocialLink> {
		const res = await this.client.query.socialLinks.findMany({
			columns: {
				userId: false,
				providerId: true,
				handle: true,
				url: true,
			},
			where: eq(schema.socialLinks.userId, userId),
		});

		if (!res) {
			throw new Error("Social services not found");
		}

		const links = res.map((link) => ({
			providerId: link.providerId,
			handle: link.handle,
			url: link.url,
		}));

		return {
			userId,
			links,
		};
	}

	async updateSocialLinks(socialLinks: ISocialLink): Promise<void> {
		const { userId, links } = socialLinks;
		try {
		await this.client
			.delete(schema.socialLinks)
			.where(eq(schema.socialLinks.userId, userId))
			.execute();

		await this.client
			.insert(schema.socialLinks)
			.values(
				links.map((link) => ({
					userId,
					providerId: link.providerId,
					handle: link.handle,
					url: link.url,
				})),
			)
			.execute();
		} catch (error) {
			throw new Error("Failed to update social links");
		}
	}
}
