import { vValidator } from "@hono/valibot-validator";
import { setCookie } from "hono/cookie";
import * as v from "valibot";
import { factory } from "../../factory";
import { authLoginGithubRoute } from "./github";

const app = factory.createApp();

const route = app
	.get(
		"/",
		vValidator(
			"query",
			v.object({
				continue_to: v.optional(v.string()),
			}),
		),
		async (c) => {
			const { continue_to } = c.req.valid("query");

			setCookie(c, "continue_to", continue_to ?? "/");

			// @sor4chi たのんだ
			// これも Client 側にする？
			const responseHtml = `
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ログイン</title>
</head>
<body>
  <h1>ログイン</h1>
  <p>ログインしてください</p>
  <a href="/auth/login/github">GitHub でログイン</a>
</body>
</html>
`;

			return c.html(responseHtml);
		},
	)
	.route("/github", authLoginGithubRoute);

export { route as authLoginRoute };
