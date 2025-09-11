import { factory } from "../../factory";
import { noCacheMiddleware } from "../../middleware/cache";
import { derivePublicKey, importKey } from "../../utils/oauth/key";
import { oauthAccessTokenRoute } from "./accessToken";
import { oauthAuthorizeRoute } from "./authorize";
import { oauthCallbackRoute } from "./callback";
import { oauthManageRoute } from "./manage";
import { oauthResourcesRoute } from "./resources";
import { oauthUtilRoute } from "./util";
import { oauthVerifyTokenRoute } from "./verifyToken";

const app = factory.createApp();

const route = app
	.use(noCacheMiddleware)
	.route("/authorize", oauthAuthorizeRoute)
	.route("/callback", oauthCallbackRoute)
	.route("/access-token", oauthAccessTokenRoute)
	.route("/verify-token", oauthVerifyTokenRoute)
	.route("/util", oauthUtilRoute)
	.route("/manage", oauthManageRoute)
	.route("/resources", oauthResourcesRoute)
	.get("/jwks", async (c) => {
		// 量が少ないので直書き
		const { jwk: privKeyJwk } = await importKey(
			c.env.PRIVKEY_FOR_OAUTH,
			"privateKey",
		);
		const pubKeyJwk = derivePublicKey(privKeyJwk);
		return c.json({
			keys: [pubKeyJwk],
		});
	});

export { route as oauthRoute };
