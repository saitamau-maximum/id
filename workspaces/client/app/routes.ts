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
			...(FLAG.ENABLE_CALENDAR
				? [route("calendar", "routes/dashboard/calendar/page.tsx")]
				: []),
			route("settings", "routes/dashboard/settings/page.tsx"),
			...prefix("admin", [
				layout("routes/dashboard/admin/layout.tsx", [
					index("routes/dashboard/admin/home/page.tsx"),
					...prefix("users", [
						layout("routes/dashboard/admin/users/layout.tsx", [
							index("routes/dashboard/admin/users/page.tsx"),
						]),
					]),
					...(FLAG.ENABLE_INVITE
						? [
								...prefix("invites", [
									layout("routes/dashboard/admin/invites/layout.tsx", [
										index("routes/dashboard/admin/invites/page.tsx"),
									]),
								]),
							]
						: []),
					...prefix("certifications", [
						layout("routes/dashboard/admin/certifications/layout.tsx", [
							index("routes/dashboard/admin/certifications/page.tsx"),
						]),
					]),
					...(FLAG.ENABLE_CALENDAR
						? [
								...prefix("events", [
									layout("routes/dashboard/admin/events/layout.tsx", [
										index("routes/dashboard/admin/events/page.tsx"),
									]),
								]),
							]
						: []),
				]),
			]),
			...prefix("oauth-apps", [
				layout("routes/dashboard/oauth-apps/layout.tsx", [
					index("routes/dashboard/oauth-apps/home/page.tsx"),
					route(":oauthAppId", "routes/dashboard/oauth-apps/config/page.tsx"),
					route("register", "routes/dashboard/oauth-apps/register/page.tsx"),
				]),
			]),
		]),
		...(FLAG.ENABLE_INVITE
			? prefix("invitation", [route(":id", "routes/invitation/page.tsx")])
			: []),
		route("payment-info", "routes/payment-info/page.tsx"),
		route("onboarding", "routes/onboarding/page.tsx"),
		route("verify", "routes/verify.tsx"),
		route("login", "routes/login/page.tsx"),
	]),
] satisfies RouteConfig;
