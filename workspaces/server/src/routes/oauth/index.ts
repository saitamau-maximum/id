import { jwt } from "hono/jwt";
import { factory } from "../../factory";
import { oauthAuthorizeRoute } from "./authorize";

const app = factory.createApp();

const route = app
	// TODO: Auth 承認手続きに入る前にログインさせる
	.route("/authorize", oauthAuthorizeRoute);

export { route as oauthRoute };
