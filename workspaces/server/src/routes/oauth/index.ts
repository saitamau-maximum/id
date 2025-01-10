import { factory } from "../../factory";
import { oauthAccessTokenRoute } from "./accessToken";
import { oauthAuthorizeRoute } from "./authorize";
import { oauthCallbackRoute } from "./callback";
import { oauthUtilRoute } from "./util";
import { oauthVerifyTokenRoute } from "./verifyToken";

const app = factory.createApp();

const route = app
	// TODO: Auth 承認手続きに入る前にログインさせる
	.route("/authorize", oauthAuthorizeRoute)
	.route("/callback", oauthCallbackRoute)
	.route("/access-token", oauthAccessTokenRoute)
	.route("/verify-token", oauthVerifyTokenRoute)
	.route("/util", oauthUtilRoute);

export { route as oauthRoute };
