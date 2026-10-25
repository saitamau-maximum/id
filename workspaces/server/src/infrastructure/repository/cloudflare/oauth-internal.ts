import type { OAuthConnection } from "@idp/schema/entity/oauth-internal/oauth-connection";
import {
	OAUTH_PROVIDER_IDS,
	OAuthProviderId,
} from "@idp/schema/entity/oauth-internal/oauth-provider";
import {
	OAuth2Routes,
	type RESTPostOAuth2AccessTokenResult,
} from "discord-api-types/v10";
import { and, eq, gte, isNull, or } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as v from "valibot";
import * as schema from "../../../db/schema";
import type { IOAuthInternalRepository } from "./../../../repository/oauth-internal";
import { decrypt, deriveKey, encrypt } from "../../../utils/encryption";

export class CloudflareOAuthInternalRepository
	implements IOAuthInternalRepository
{
	private client: DrizzleD1Database<typeof schema>;
	private env: Env;

	constructor(db: D1Database, env: Env) {
		this.client = drizzle(db, { schema });
		this.env = env;
	}

	private async deriveEncryptionKey(): Promise<CryptoKey> {
		return deriveKey(
			this.env.SECRET,
			// key rotation 時には乱数部分を変えれば OK
			"oauth-connection-token-encryption.381338454502",
			{ name: "AES-GCM", length: 256 },
			["encrypt", "decrypt"],
		);
	}

	private async encryptToken(
		token: string | null | undefined,
	): Promise<string | null> {
		if (!token) return null;
		const encryptionKey = await this.deriveEncryptionKey();
		return encrypt(encryptionKey, token);
	}

	private async decryptToken(
		token: string | null | undefined,
	): Promise<string | null> {
		if (!token) return null;
		const encryptionKey = await this.deriveEncryptionKey();
		return decrypt(encryptionKey, token);
	}

	async fetchUserIdByProviderInfo(
		providerUserId: string,
		providerId: OAuthProviderId,
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
		return user.oauthConnections
			.filter((conn) => v.is(OAuthProviderId, conn.providerId))
			.map((conn) => ({
				...conn,
				providerId: conn.providerId as OAuthProviderId,
			}));
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
		return userProfile.oauthConnections
			.filter((conn) => v.is(OAuthProviderId, conn.providerId))
			.map((conn) => ({
				...conn,
				providerId: conn.providerId as OAuthProviderId,
			}));
	}

	async createOAuthConnection(data: OAuthConnection): Promise<void> {
		const refreshToken = await this.encryptToken(data.refreshToken);
		await this.client.insert(schema.oauthConnections).values({
			...data,
			refreshToken,
		});
	}

	async updateOAuthConnection(data: OAuthConnection): Promise<void> {
		const refreshToken = await this.encryptToken(data.refreshToken);
		await this.client
			.update(schema.oauthConnections)
			.set({
				...data,
				refreshToken,
			})
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
		providerId: OAuthProviderId,
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
		providerId: OAuthProviderId,
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

		if (!res?.refreshToken) return null;

		// しばらくの間は暗号化されていない可能性があるので、復号に失敗した場合は null を返して再ログインを促す
		const decryptedRefreshToken = await this.decryptToken(
			res.refreshToken,
		).catch(() => null);
		if (!decryptedRefreshToken) return null;

		if (providerId === OAUTH_PROVIDER_IDS.GITHUB) {
			// GitHub の場合、 Access Token をそのまま Refresh Token として保存している
			return decryptedRefreshToken;
		}
		if (providerId === OAUTH_PROVIDER_IDS.DISCORD) {
			// Discord の場合、 Refresh Token から Access Token を取得する
			const body = new URLSearchParams();
			body.set("grant_type", "refresh_token");
			body.set("refresh_token", decryptedRefreshToken);
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
						refreshToken: await this.encryptToken(response.refresh_token),
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
