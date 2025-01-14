import {
	type RouteConfig,
	index,
	layout,
	prefix,
	route,
} from "@react-router/dev/routes";

export default [
	layout("./components/layout/wrapper.tsx", [
		layout("./components/layout/dashboard.tsx", [
			index("routes/home/page.tsx"),
			route("members/:userDisplayId", "routes/profile/page.tsx"),
			route("members", "routes/members/page.tsx"),
			route("settings", "routes/settings/page.tsx"),
			...prefix("admin", [
				layout("./routes/admin/layout.tsx", [
					index("routes/admin/home/page.tsx"),
					route("users", "routes/admin/users/page.tsx"),
				]),
			]),
		]),
		route("onboarding", "routes/onboarding/page.tsx"),
		route("verify", "routes/verify.tsx"),
		route("login", "routes/login/page.tsx"),
	]),
] satisfies RouteConfig;
