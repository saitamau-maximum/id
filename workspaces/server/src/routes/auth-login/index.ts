import { factory } from "../../factory";
import { authLoginGithubRoute } from "./github";

const app = factory.createApp();

const route = app.route("/github", authLoginGithubRoute);

export { route as authLoginRoute };
