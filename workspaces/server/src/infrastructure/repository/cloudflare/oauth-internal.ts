import {
	OAuth2Routes,
	type RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v10";
import { and, eq, gte, isNull, or } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { OAUTH_PROVIDER_IDS } from "../../../constants/oauth";
import * as schema from "../../../db/schema";
import type {
	IOAuthInternalRepository,
	OAuthConnection,
} from "./../../../repository/oauth-internal";

export class CloudflareOAuthInternalRepository
	implements IOAuthInternalRepository
{
	private client: DrizzleD1Database<typeof schema>;
	private env: Env;

	constructor(db: D1Database, env: Env) {
		this.client = drizzle(db, { schema });
		this.env = env;
	}

	async fetchUserIdByProviderInfo(
		providerUserId: string,
		providerId: number,
	): Promise<string> {
		const res = await this.client.query.oauthConnections.findFirst({
			where: (oauthConn, { eq, and }) =>
				and(
					eq(oauthConn.providerId, providerId),
					eq(oauthConn.providerUserId, providerUserId),
				),
		});

		if (!res) throw new Error("User not found");
		return res.userId;
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
		if (!user) throw new Error("User not found");
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
		if (!userProfile) throw new Error("User not found");
		return userProfile.oauthConnections;
	}

	async createOAuthConnection(data: OAuthConnection): Promise<void> {
		await this.client.insert(schema.oauthConnections).values(data);
	}

	async updateOAuthConnection(data: OAuthConnection): Promise<void> {
		await this.client
			.update(schema.oauthConnections)
			.set(data)
			.where(
				and(
					eq(schema.oauthConnections.userId, data.userId),
					eq(schema.oauthConnections.providerUserId, data.providerUserId),
					eq(schema.oauthConnections.providerId, data.providerId),
				),
			);
	}

	async deleteOAuthConnection(
		userId: string,
		providerId: number,
	): Promise<void> {
		await this.client
			.delete(schema.oauthConnections)
			.where(
				and(
					eq(schema.oauthConnections.userId, userId),
					eq(schema.oauthConnections.providerId, providerId),
				),
			);
	}

	async fetchAccessTokenByUserId(
		userId: string,
		providerId: number,
	): Promise<string | null> {
		const now = new Date();

		const res = await this.client.query.oauthConnections.findFirst({
			where: and(
				eq(schema.oauthConnections.userId, userId),
				eq(schema.oauthConnections.providerId, providerId),
				or(
					isNull(schema.oauthConnections.refreshTokenExpiresAt),
					gte(schema.oauthConnections.refreshTokenExpiresAt, now),
				),
			),
			columns: {
				refreshToken: true,
			},
		});

		if (!res || !res.refreshToken) return null;

		if (providerId === OAUTH_PROVIDER_IDS.GITHUB) {
			// GitHub の場合、 Access Token をそのまま Refresh Token として保存している
			return res.refreshToken;
		}
		if (providerId === OAUTH_PROVIDER_IDS.DISCORD) {
			// Discord の場合、 Refresh Token から Access Token を取得する
			const body = new URLSearchParams();
			body.set("grant_type", "refresh_token");
			body.set("refresh_token", res.refreshToken);
			body.set("client_id", this.env.DISCORD_OAUTH_ID);
			body.set("client_secret", this.env.DISCORD_OAUTH_SECRET);

			try {
				const response = await fetch(OAuth2Routes.tokenURL, {
					method: "POST",
					body,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
						Accept: "application/json",
					},
				}).then((res) => res.json<RESTPostOAuth2AccessTokenResult>());

				// 新しい refresh_token で更新する
				await this.client
					.update(schema.oauthConnections)
					.set({
						refreshToken: response.refresh_token,
						refreshTokenExpiresAt: null,
					})
					.where(
						and(
							eq(schema.oauthConnections.userId, userId),
							eq(schema.oauthConnections.providerId, providerId),
						),
					);

				// すぐ使う想定なので expires_in は無視
				return response.access_token;
			} catch {
				return null;
			}
		}
		throw new Error(`Unreachable, unknown providerId ${providerId}`);
	}
}
