import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("./components/layout/wrapper.tsx", [
		layout("./components/layout/dashboard.tsx", [index("routes/home.tsx")]),
		route("onboarding", "routes/onboarding/page.tsx"),
		route("verify", "routes/verify.tsx"),
		route("login", "routes/login.tsx"),
	]),
] satisfies RouteConfig;
