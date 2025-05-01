import { factory } from "../../factory";
import { authLoginDiscordRoute } from "./discord";
import { authLoginGithubRoute } from "./github";

const app = factory.createApp();

const route = app
	.route("/github", authLoginGithubRoute)
	.route("/discord", authLoginDiscordRoute);

export { route as authLoginRoute };
