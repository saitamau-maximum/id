import { factory } from "../../factory";
import { oauthAuthorizeRoute } from "./authorize";
import { oauthCallbackRoute } from "./callback";

const app = factory.createApp();

const route = app
	// TODO: Auth 承認手続きに入る前にログインさせる
	.route("/authorize", oauthAuthorizeRoute)
	.route("/callback", oauthCallbackRoute);

export { route as oauthRoute };
