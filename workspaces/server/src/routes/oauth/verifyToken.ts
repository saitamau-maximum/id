import { factory } from "../../factory";
import { authByAccessTokenMiddleware } from "../../middleware/oauth";

const app = factory.createApp();

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/43

interface ValidResponseType {
	valid: true;
	client: {
		id: string;
		name: string;
		description: string | null;
		logo_url: string | null;
		owner_id: string;
	};
	user_id: string;
	expires_at: number;
	scopes: string[];
}

interface InvalidResponseType {
	valid: false;
	client: null;
	user_id: null;
	expires_at: null;
	scopes: null;
}

const INVALID_REQUEST_RESPONSE: InvalidResponseType = {
	valid: false,
	client: null,
	user_id: null,
	expires_at: null,
	scopes: null,
};

const route = app
	.get("/", authByAccessTokenMiddleware, async (c) => {
		const tokenInfo = c.var.tokenInfo;

		c.header("Cache-Control", "no-store");
		c.header("Pragma", "no-cache");

		// Token が見つからない場合
		if (!tokenInfo) {
			return c.json<InvalidResponseType>(INVALID_REQUEST_RESPONSE, 404);
		}

		const res: ValidResponseType = {
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
		};

		return c.json<ValidResponseType>(res);
	})
	.all("/", async (c) => {
		return c.text("method not allowed", 405);
	});

export { route as oauthVerifyTokenRoute };
