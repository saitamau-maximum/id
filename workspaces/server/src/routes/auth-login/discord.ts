import {
	type APIUser,
	CDNRoutes,
	type DefaultUserAvatarAssets,
	ImageFormat,
	OAuth2Routes,
	OAuth2Scopes,
	type RESTPostOAuth2AccessTokenResult,
	RouteBases,
} from "discord-api-types/v10";
import { OAUTH_PROVIDER_IDS } from "../../constants/oauth";
import { factory } from "../../factory";
import type { OAuthConnection } from "../../repository/oauth-internal";
import { OAuthLoginProvider } from "../../utils/oauth-login-provider";

const app = factory.createApp();

class DiscordLoginProvider extends OAuthLoginProvider {
	private accessTokenResponse: RESTPostOAuth2AccessTokenResult | null = null;
	private user: APIUser | null = null;

	private async makeAccessTokenRequest(code: string): Promise<void> {
		const body = new URLSearchParams();
		body.set("grant_type", "authorization_code");
		body.set("code", code);
		body.set("redirect_uri", this.getCallbackUrl());
		body.set("client_id", this.getClientId());
		body.set("client_secret", this.getClientSecret());

		return fetch(OAuth2Routes.tokenURL, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Accept: "application/json",
			},
			body,
		}).then(async (res) => {
			this.accessTokenResponse =
				await res.json<RESTPostOAuth2AccessTokenResult>();
		});
	}

	private async getDiscordUser(): Promise<APIUser> {
		if (!this.honoVariables) throw new Error("honoVariables is not set");
		if (!this.accessTokenResponse || !this.accessTokenResponse.access_token)
			throw new Error("Access token response is not available");

		if (!this.user)
			this.user =
				await this.honoVariables.DiscordBotRepository.fetchUserByAccessToken(
					this.accessTokenResponse.access_token,
				);

		return this.user;
	}

	acceptsInvitation(): boolean {
		return false;
	}

	getAuthorizationUrl(): URL {
		// ref: https://discord.com/developers/docs/topics/oauth2
		const url = new URL(OAuth2Routes.authorizationURL);
		url.searchParams.set(
			"scope",
			[OAuth2Scopes.Identify, OAuth2Scopes.GuildsJoin].join(" "),
		);
		url.searchParams.set("integration_type", "1"); // 個人認証のため USER_INSTALL にする
		return url;
	}

	getClientId(): string {
		if (!this.env) throw new Error("Environment is not set");
		return this.env.DISCORD_OAUTH_ID;
	}

	getClientSecret(): string {
		if (!this.env) throw new Error("Environment is not set");
		return this.env.DISCORD_OAUTH_SECRET;
	}

	getCallbackUrl(): string {
		if (!this.origin) throw new Error("Origin is not set");
		return `${this.origin}/auth/login/discord/callback`;
	}

	async getAccessToken(code: string): Promise<string> {
		await this.makeAccessTokenRequest(code);
		if (!this.accessTokenResponse)
			throw new Error("Failed to fetch access token");
		return this.accessTokenResponse.access_token;
	}

	getAccessTokenExpiresAt(): Date | null {
		if (!this.accessTokenResponse)
			throw new Error("Access token response is not available");
		const unixMs =
			new Date().valueOf() + this.accessTokenResponse.expires_in * 1000;
		return new Date(unixMs);
	}

	getRefreshToken(): string {
		if (!this.accessTokenResponse)
			throw new Error("Access token response is not available");
		return this.accessTokenResponse.refresh_token;
	}

	getRefreshTokenExpiresAt(): Date | null {
		// Discord では Refresh Token の有効期限はないっぽい？
		return null;
	}

	getProviderId(): number {
		return OAUTH_PROVIDER_IDS.DISCORD;
	}

	async getProviderUserId(): Promise<string> {
		const user = await this.getDiscordUser();
		if (!user) throw new Error("Discord user is not available");
		return user.id;
	}

	async getOAuthConnectionUserPayload(): Promise<
		Pick<OAuthConnection, "name" | "profileImageUrl" | "email">
	> {
		const discordUser = await this.getDiscordUser();

		return {
			name: discordUser.username,
			// avatar は image hash が入る
			// ref: https://discord.com/developers/docs/resources/user#usernames-and-nicknames, https://discord.com/developers/docs/reference#image-formatting
			profileImageUrl: discordUser.avatar
				? RouteBases.cdn +
					CDNRoutes.userAvatar(
						discordUser.id,
						discordUser.avatar,
						ImageFormat.WebP,
					)
				: RouteBases.cdn +
					CDNRoutes.defaultUserAvatar(
						// new username system なら (id >> 22) % 6 で、 legacy username system なら discriminator % 5 らしい
						// discriminator が "0" の場合は new username system とのこと
						// ref: https://discord.com/developers/docs/change-log#identifying-migrated-users
						discordUser.discriminator === "0"
							? (((((Number.parseInt(discordUser.id, 10) >> 22) % 6) + 6) %
									6) as DefaultUserAvatarAssets)
							: ((Number.parseInt(discordUser.discriminator, 10) %
									5) as DefaultUserAvatarAssets),
					),
			// 取得したい場合には email scope をつける
			email: discordUser.email ?? null,
		};
	}
}

const discordLogin = new DiscordLoginProvider();

const route = app
	.get("/", ...discordLogin.loginHandlers())
	.get("/callback", ...discordLogin.callbackHandlers());

export { route as authLoginDiscordRoute };
