import { eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	IOAuthInternalRepository,
	OAuthConnection,
} from "./../../../repository/oauth-internal";

export class CloudflareOAuthInternalRepository
	implements IOAuthInternalRepository
{
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async fetchOAuthConnectionsByUserId(
		userId: string,
	): Promise<OAuthConnection[]> {
		const user = await this.client.query.users.findFirst({
			where: eq(schema.users.id, userId),
			with: {
				profile: true,
				oauthConnections: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return user.oauthConnections;
	}
	async fetchOAuthConnectionsByUserDisplayId(
		displayId: string,
	): Promise<OAuthConnection[]> {
		const userProfile = await this.client.query.userProfiles.findFirst({
			where: eq(schema.userProfiles.displayId, displayId),
			with: {
				oauthConnections: true,
			},
		});

		if (!userProfile) {
			throw new Error("User not found");
		}

		return userProfile.oauthConnections;
	}
}
