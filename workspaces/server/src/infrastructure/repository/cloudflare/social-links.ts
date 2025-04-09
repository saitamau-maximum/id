import { and, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import { parseSocialLink } from "../../../utils/parse-social-link";
import type {
	ISocialLink,
	ISocialLinkRepository,
} from "../../../repository/social-link";
import { SOCIAL_SERVICE_BY_ID } from "../../../constants/social";

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
			providerId: SOCIAL_SERVICE_BY_ID[link.providerId],
			handle: link.handle,
			url: link.url,
		}));

		return {
			userId,
			links,
		};
	}

	async updateSocialLinks(userId: string, links: string[]): Promise<void> {
		const parsedLinks = links.map((link) => parseSocialLink(link));

		try {
		await this.client
			.delete(schema.socialLinks)
			.where(eq(schema.socialLinks.userId, userId))
			.execute();

		await this.client
			.insert(schema.socialLinks)
			.values(
				parsedLinks.map((link) => ({
					userId,
					providerId: link.providerId,
					handle: link.handle,
					url: link.url,
				})),
			)
			.execute();
		} catch (error) {
			console.error(error);
			throw new Error("Failed to update social links");
		}
	}
}
