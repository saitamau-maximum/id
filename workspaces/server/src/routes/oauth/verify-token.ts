import type {
	VerifyTokenFailureResponse,
	VerifyTokenSuccessResponse,
} from "@idp/schema/api/oauth/verify-token";
import { factory } from "../../factory";

const app = factory.createApp();

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/43

const INVALID_REQUEST_RESPONSE: VerifyTokenFailureResponse = {
	valid: false,
	client: null,
	user_id: null,
	expires_at: null,
	scopes: null,
};

const route = app
	.get("/", async (c) => {
		// authByAccessTokenMiddleware は、 tokenInfo が存在しない場合に 401 Unauthorized を返したくないので使わない
		const authorization = c.req.header("Authorization");
		const AUTHORIZATION_REGEX = /^Bearer (.+)$/;
		const accessToken = authorization?.match(AUTHORIZATION_REGEX)?.[1];
		if (!accessToken) {
			return c.text("Unauthorized", 401);
		}

		const tokenInfo =
			await c.var.OAuthExternalRepository.getTokenByAccessToken(accessToken);

		if (!tokenInfo) {
			return c.json<VerifyTokenFailureResponse>(INVALID_REQUEST_RESPONSE, 404);
		}

		const res = {
			valid: true,
			client: {
				id: tokenInfo.client.id,
				name: tokenInfo.client.name,
				description: tokenInfo.client.description,
				logo_url: tokenInfo.client.logoUrl,
				owner_id: tokenInfo.client.ownerId,
			},
			user_id: tokenInfo.userId,
			expires_at: tokenInfo.accessTokenExpiresAt.getTime(),
			scopes: tokenInfo.scopes.map((s) => s.name),
		} satisfies VerifyTokenSuccessResponse;

		return c.json<VerifyTokenSuccessResponse>(res);
	})
	.all("/", async (c) => {
		return c.text("method not allowed", 405);
	});

export { route as oauthVerifyTokenRoute };
