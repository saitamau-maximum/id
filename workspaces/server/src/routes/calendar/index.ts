import { factory } from "../../factory";
import { authMiddleware } from "../../middleware/auth";
import { calendarEventRoute } from "./events";
import { calendarLocationRoute } from "./location";

const app = factory.createApp();

const route = app
	// 活動場所等が筒抜けになると怖いので、基本的には認証が必要とする
	.use(authMiddleware)
	.route("/events", calendarEventRoute)
	.route("/locations", calendarLocationRoute);

export { route as calendarRoute };
