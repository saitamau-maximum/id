import { factory } from "../../factory";
import { oauthAccessTokenRoute } from "./accessToken";
import { oauthAuthorizeRoute } from "./authorize";
import { oauthCallbackRoute } from "./callback";
import { oauthManageRoute } from "./manage";
import { oauthResourcesRoute } from "./resources";
import { oauthUtilRoute } from "./util";
import { oauthVerifyTokenRoute } from "./verifyToken";

const app = factory.createApp();

const route = app
	.use(async (c, next) => {
		await next();
		// それぞれで設定して漏れがあると怖いので、ここで一括設定
		c.header("Cache-Control", "no-store");
		c.header("Pragma", "no-cache");
		c.header("Expires", "0");
	})
	.route("/authorize", oauthAuthorizeRoute)
	.route("/callback", oauthCallbackRoute)
	.route("/access-token", oauthAccessTokenRoute)
	.route("/verify-token", oauthVerifyTokenRoute)
	.route("/util", oauthUtilRoute)
	.route("/manage", oauthManageRoute)
	.route("/resources", oauthResourcesRoute);

export { route as oauthRoute };
