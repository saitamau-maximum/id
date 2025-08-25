import { factory } from "../factory";

const app = factory.createApp();

// どうせここでしか使わないので middleware には置かない
const onlyDevMiddleware = factory.createMiddleware(async (c, next) => {
	if (c.env.ENV !== "development") {
		return c.text("Not found", 404);
	}
	return next();
});

const route = app
	.use(onlyDevMiddleware)
	.get("/cron", (c) => {
		// 量が少ないので直書き
		const res = `
<h1>Cron Simulator</h1>
<form method="GET" action="/__scheduled">
  <label for="cron">Cron expression:</label>
  <input type="text" id="cron" name="cron" placeholder="0 18 * * *">
  <button type="submit">Simulate</button>
</form>
`;
		return c.html(res);
	})
	.get("/oauth/:clientId/:clientSecret", async (c) => {
		const { clientId, clientSecret } = c.req.param();
		const redirectTo = new URL(c.req.url);
		redirectTo.pathname = "/oauth/authorize";
		redirectTo.searchParams.set("response_type", "code");
		redirectTo.searchParams.set("client_id", clientId);
		redirectTo.searchParams.set(
			"redirect_uri",
			`${redirectTo.origin}/dev/oauth/${clientId}/${clientSecret}/callback`,
		);
		return c.redirect(redirectTo.toString(), 302);
	})
	.get("/oauth/:clientId/:clientSecret/callback", async (c) => {
		const { clientId, clientSecret } = c.req.param();
		const { code } = c.req.query();
		if (!code) {
			return c.text("Bad Request: code is required", 400);
		}
		const url = new URL(c.req.url);
		const body = new FormData();
		body.append("grant_type", "authorization_code");
		body.append("code", code);
		body.append(
			"redirect_uri",
			`${url.origin}/dev/oauth/${clientId}/${clientSecret}/callback`,
		);

		const res = await fetch(`${url.origin}/oauth/access-token`, {
			method: "POST",
			body,
			headers: {
				Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, // client_id と client_secret は Basic 認証で送る
			},
		});
		c.header("Cache-Control", "no-store");
		c.header("Pragma", "no-cache");
		const resj = await res.json();
		return c.json(resj as Record<string, unknown>, 200);
	});

export { route as devRoute };
