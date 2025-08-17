import type { Endpoints } from "@octokit/types";
import { Octokit } from "octokit";
import { OAUTH_PROVIDER_IDS } from "../../constants/oauth";
import { factory } from "../../factory";
import type { OAuthConnection } from "../../repository/oauth-internal";
import { OAuthLoginProvider } from "../../utils/oauth-login-provider";

const app = factory.createApp();

interface GitHubOAuthTokenResponse {
	access_token: string;
	scope: string;
	token_type: string;
}

type GitHubUser = Endpoints["GET /user"]["response"]["data"];

class GitHubLoginProvider extends OAuthLoginProvider {
	private accessTokenResponse: GitHubOAuthTokenResponse | null = null;
	private user: GitHubUser | null = null;

	getClientId(): string {
		if (!this.env) throw new Error("Environment is not set");
		return this.env.GITHUB_OAUTH_ID;
	}

	getClientSecret(): string {
		if (!this.env) throw new Error("Environment is not set");
		return this.env.GITHUB_OAUTH_SECRET;
	}

	getCallbackUrl(): string {
		if (!this.origin) throw new Error("Origin is not set");
		return `${origin}/auth/login/github/callback`;
	}

	private async makeAccessTokenRequest(code: string) {
		return fetch("https://github.com/login/oauth/access_token", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				client_id: this.getClientId(),
				client_secret: this.getClientSecret(),
				redirect_uri: this.getCallbackUrl(),
				code,
			}),
		}).then(async (res) => {
			this.accessTokenResponse = await res.json<GitHubOAuthTokenResponse>();
		});
	}

	async getAccessToken(code: string): Promise<string> {
		await this.makeAccessTokenRequest(code);
		if (!this.accessTokenResponse)
			throw new Error("Failed to fetch access token");
		return this.accessTokenResponse.access_token;
	}

	private getCachedAccessToken(): string {
		if (!this.accessTokenResponse)
			throw new Error("Access token response is not available");
		return this.accessTokenResponse.access_token;
	}

	getAccessTokenExpiresAt(): Date | null {
		// GitHub では Access Token の有効期限はないっぽい？
		return null;
	}

	getRefreshToken(): string {
		if (!this.accessTokenResponse)
			throw new Error("Access token response is not available");
		// GitHub では OAuth Access Token は Revoke しない限り無期限に使える？っぽいので Refresh Token として保管する
		return this.accessTokenResponse.access_token;
	}

	getRefreshTokenExpiresAt(): Date | null {
		return null;
	}

	getProviderId(): number {
		return OAUTH_PROVIDER_IDS.GITHUB;
	}

	private async getGitHubUser(): Promise<GitHubUser> {
		if (!this.user) {
			const userOctokit = new Octokit({ auth: this.getCachedAccessToken() });
			const { data } = await userOctokit.request("GET /user");
			this.user = data;
		}
		return this.user;
	}

	async getProviderUserId(): Promise<string> {
		return (await this.getGitHubUser()).id.toString();
	}

	async getOAuthConnectionUserPayload(): Promise<
		Pick<OAuthConnection, "name" | "profileImageUrl" | "email">
	> {
		const user = await this.getGitHubUser();

		return {
			name: user.login,
			email: user.email ?? null,
			profileImageUrl: user.avatar_url,
		};
	}
}

const githubLogin = new GitHubLoginProvider({
	enableInvitation: true,

	// ref: https://docs.github.com/ja/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
	scopes: ["read:user"],
	authorizationUrl: "https://github.com/login/oauth/authorize",
	authorizationOptions: {
		allow_signup: "false",
	},
});

const route = app
	.get("/", ...githubLogin.getLoginHandlers())
	.get("/callback", ...githubLogin.getCallbackHandlers());

export { route as authLoginGithubRoute };
