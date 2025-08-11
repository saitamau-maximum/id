import { factory } from "../factory";

const app = factory.createApp();

// どうせここでしか使わないので middleware には置かない
const onlyDevMiddleware = factory.createMiddleware(async (c, next) => {
	if (c.env.ENV !== "development") {
		return c.text("Not found", 404);
	}
	return next();
});

const route = app.use(onlyDevMiddleware).get("/cron", (c) => {
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
});

export { route as devRoute };
