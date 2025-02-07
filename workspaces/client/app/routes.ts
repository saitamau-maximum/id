import {
	type RouteConfig,
	index,
	layout,
	prefix,
	route,
} from "@react-router/dev/routes";
import { FLAG } from "./utils/flag";

export default [
	layout("routes/layout.tsx", [
		layout("routes/dashboard/layout.tsx", [
			index("routes/dashboard/home/page.tsx"),
			...prefix("members", [
				index("routes/dashboard/members/page.tsx"),
				route(":userDisplayId", "routes/dashboard/members/profile/page.tsx"),
			]),
			route("settings", "routes/dashboard/settings/page.tsx"),
			...prefix("admin", [
				layout("routes/dashboard/admin/layout.tsx", [
					index("routes/dashboard/admin/home/page.tsx"),
					route("users", "routes/dashboard/admin/users/page.tsx"),
				]),
			]),
			...(FLAG.ENABLE_OAUTH_REGISTRATION
				? prefix("oauth-apps", [
						layout("routes/dashboard/oauth-apps/layout.tsx", [
							index("routes/dashboard/oauth-apps/home/page.tsx"),
							route(
								":oauthAppId",
								"routes/dashboard/oauth-apps/config/page.tsx",
							),
							route(
								"register",
								"routes/dashboard/oauth-apps/register/page.tsx",
							),
						]),
					])
				: []),
		]),
		route("onboarding", "routes/onboarding/page.tsx"),
		route("verify", "routes/verify.tsx"),
		route("login", "routes/login/page.tsx"),
	]),
] satisfies RouteConfig;
