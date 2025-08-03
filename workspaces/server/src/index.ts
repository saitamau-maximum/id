import { createAppAuth } from "@octokit/auth-app";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Octokit } from "octokit";
import { removeExpiredAccessTokenTask } from "./cron-tasks/remove-expired-access-token";
import { factory } from "./factory";
import { CloudflareContributionCacheRepository } from "./infrastructure/repository/cloudflare/cache";
import { CloudflareCalendarRepository } from "./infrastructure/repository/cloudflare/calendar";
import { CloudflareCertificationRepository } from "./infrastructure/repository/cloudflare/certification";
import { CloudflareInviteRepository } from "./infrastructure/repository/cloudflare/invite";
import { CloudflareLocationRepository } from "./infrastructure/repository/cloudflare/location";
import { CloudflareOAuthAppRepository } from "./infrastructure/repository/cloudflare/oauth-app-storage";
import { CloudflareOAuthExternalRepository } from "./infrastructure/repository/cloudflare/oauth-external";
import { CloudflareOAuthInternalRepository } from "./infrastructure/repository/cloudflare/oauth-internal";
import { CloudflareSessionRepository } from "./infrastructure/repository/cloudflare/session";
import { CloudflareUserRepository } from "./infrastructure/repository/cloudflare/user";
import { CloudflareUserStorageRepository } from "./infrastructure/repository/cloudflare/user-storage";
import { DiscordBotRepository } from "./infrastructure/repository/discord/bot";
import { DiscordCalendarNotifier } from "./infrastructure/repository/discord/calendar";
import { GithubContributionRepository } from "./infrastructure/repository/github/contribution";
import { GithubOrganizationRepository } from "./infrastructure/repository/github/organization";
import { adminRoute } from "./routes/admin";
import { authRoute } from "./routes/auth";
import { calendarRoute } from "./routes/calendar";
import { certificationRoute } from "./routes/certification";
import { devRoute } from "./routes/dev";
import { discordRoute } from "./routes/discord";
import { inviteRoute } from "./routes/invite";
import { memberRoute } from "./routes/member";
import { oauthRoute } from "./routes/oauth";
import { publicRoute } from "./routes/public";
import { userRoute } from "./routes/user";

const app = factory.createApp();

export const route = app
	.use(logger())
	.use(async (c, next) => {
		const octokit = new Octokit({
			authStrategy: createAppAuth,
			auth: {
				appId: c.env.GITHUB_APP_ID,
				privateKey: atob(c.env.GITHUB_APP_PRIVKEY),
				installationId: c.env.GITHUB_APP_INSTALLID,
			},
		});

		// ----- IdP Core ----- //
		// ユーザー・セッション
		c.set(
			"SessionRepository",
			new CloudflareSessionRepository(c.env.IDP_SESSION),
		);
		c.set("UserRepository", new CloudflareUserRepository(c.env.DB));
		// Storage
		c.set(
			"UserStorageRepository",
			new CloudflareUserStorageRepository(c.env.STORAGE),
		);
		c.set(
			"OAuthAppStorageRepository",
			new CloudflareOAuthAppRepository(c.env.STORAGE),
		);
		// キャッシュ
		c.set(
			"ContributionCacheRepository",
			new CloudflareContributionCacheRepository(c.env.CACHE),
		);
		// カレンダー
		c.set("CalendarRepository", new CloudflareCalendarRepository(c.env.DB));
		c.set(
			"CalendarNotifier",
			new DiscordCalendarNotifier(c.env.CALENDAR_NOTIFY_WEBHOOK_URL),
		);
		c.set("LocationRepository", new CloudflareLocationRepository(c.env.DB));
		// 資格・試験
		c.set(
			"CertificationRepository",
			new CloudflareCertificationRepository(c.env.DB),
		);
		// 招待
		c.set("InviteRepository", new CloudflareInviteRepository(c.env.DB));
		// ----- IdP OAuth & Connect ----- //
		// 内外の OAuth 関連
		c.set(
			"OAuthInternalRepository",
			new CloudflareOAuthInternalRepository(c.env.DB, c.env),
		);
		c.set(
			"OAuthExternalRepository",
			new CloudflareOAuthExternalRepository(c.env.DB),
		);
		// GitHub 関連
		c.set("ContributionRepository", new GithubContributionRepository(octokit));
		c.set("OrganizationRepository", new GithubOrganizationRepository(octokit));
		// Discord 関連
		c.set(
			"DiscordBotRepository",
			new DiscordBotRepository(
				c.env.DISCORD_BOT_TOKEN,
				c.env.DISCORD_GUILD_ID,
				c.env.DISCORD_CALENDAR_CHANNEL_ID,
			),
		);

		// ----- Dynamic Variables ----- //
		c.set("roleIds", []);

		await next();
	})
	.use((c, next) => {
		return cors({
			origin: c.env.ALLOW_ORIGIN,
		})(c, next);
	})
	.route("/auth", authRoute)
	.route("/user", userRoute)
	.route("/member", memberRoute)
	.route("/oauth", oauthRoute)
	.route("/admin", adminRoute)
	.route("/calendar", calendarRoute)
	.route("/certification", certificationRoute)
	.route("/invite", inviteRoute)
	.route("/public", publicRoute)
	.route("/discord", discordRoute)
	.route("/dev", devRoute);

const scheduled: ExportedHandlerScheduledHandler<Env> = async (
	controller,
	env,
	ctx,
) => {
	switch (controller.cron) {
		case "0 18 * * *":
			console.log("Cron job executed at 18:00 UTC (03:00 JST)");
			ctx.waitUntil(removeExpiredAccessTokenTask(env));
			break;
		default:
			console.warn(`Unknown cron event: ${controller.cron}`);
			break;
	}
};

export default {
	fetch: app.fetch,
	scheduled,
};
