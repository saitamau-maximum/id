import { factory } from "../../factory";
import { oauthAccessTokenRoute } from "./accessToken";
import { oauthAuthorizeRoute } from "./authorize";
import { oauthCallbackRoute } from "./callback";
import { oauthManageRoute } from "./manage";
import { oauthUtilRoute } from "./util";
import { oauthVerifyTokenRoute } from "./verifyToken";

const app = factory.createApp();

const route = app
	.route("/authorize", oauthAuthorizeRoute)
	.route("/callback", oauthCallbackRoute)
	.route("/access-token", oauthAccessTokenRoute)
	.route("/verify-token", oauthVerifyTokenRoute)
	.route("/util", oauthUtilRoute)
	.route("/manage", oauthManageRoute);

export { route as oauthRoute };
