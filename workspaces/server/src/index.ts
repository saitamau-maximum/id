import { createAppAuth } from "@octokit/auth-app";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { Octokit } from "octokit";
import { removeExpiredAccessTokenTask } from "./cron-tasks/remove-expired-access-token";
import { factory } from "./factory";
import { CloudflareContributionCacheRepository } from "./infrastructure/repository/cloudflare/cache";
import { CloudflareCalendarRepository } from "./infrastructure/repository/cloudflare/calendar";
import { CloudflareCertificationRepository } from "./infrastructure/repository/cloudflare/certification";
import { CloudflareEquipmentRepository } from "./infrastructure/repository/cloudflare/equipment";
import { CloudflareInviteRepository } from "./infrastructure/repository/cloudflare/invite";
import { CloudflareLocationRepository } from "./infrastructure/repository/cloudflare/location";
import { CloudflareOAuthAppRepository } from "./infrastructure/repository/cloudflare/oauth-app-storage";
import { CloudflareOAuthExternalRepository } from "./infrastructure/repository/cloudflare/oauth-external";
import { CloudflareOAuthInternalRepository } from "./infrastructure/repository/cloudflare/oauth-internal";
import { CloudflareUserRepository } from "./infrastructure/repository/cloudflare/user";
import { CloudflareUserStorageRepository } from "./infrastructure/repository/cloudflare/user-storage";
import { DiscordBotRepository } from "./infrastructure/repository/discord/bot";
import { GithubContributionRepository } from "./infrastructure/repository/github/contribution";
import { GithubOrganizationRepository } from "./infrastructure/repository/github/organization";
import { adminRoute } from "./routes/admin";
import { authRoute } from "./routes/auth";
import { calendarRoute } from "./routes/calendar";
import { certificationRoute } from "./routes/certification";
import { devRoute } from "./routes/dev";
import { discordRoute } from "./routes/discord";
import { equipmentRoute } from "./routes/equipment";
import { inviteRoute } from "./routes/invite";
import { memberRoute } from "./routes/member";
import { oauthRoute } from "./routes/oauth";
import { publicRoute } from "./routes/public";
import { userRoute } from "./routes/user";
import { wellKnownRoute } from "./routes/well-known";

const app = factory.createApp();

export const route = app
	.use(logger())
	.use(async (c, next) => {
		// 基本的には個人に紐づく情報を扱っているので public キャッシュさせない (各 route 側で上書き可能)
		c.header("Cache-Control", "private");
		await next();
	})
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
		// ユーザー
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
		c.set("LocationRepository", new CloudflareLocationRepository(c.env.DB));
		// 資格・試験
		c.set(
			"CertificationRepository",
			new CloudflareCertificationRepository(c.env.DB),
		);
		// 備品管理
		c.set("EquipmentRepository", new CloudflareEquipmentRepository(c.env.DB));
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
		if (c.req.path === "/public" || c.req.path.startsWith("/public/")) {
			// /publicはすべての origin からのアクセスを許可
			return cors({
				origin: "*",
			})(c, next);
		}

		return cors({
			// ctx の型が Context<any, any, {}> になってしまうため、 typeof c で対応
			origin: (origin, ctx: typeof c) => {
				// 本番環境ではクライアントが単一 (https://id.maximum.vc = CLIENT_ORIGIN) なので、それだけ許可する
				if (ctx.env.ENV === "production") {
					return ctx.env.CLIENT_ORIGIN;
				}
				// preview は軽くチェックする (https://*.id-131.pages.dev/ なら OK とする)
				if (ctx.env.ENV === "preview") {
					try {
						const url = new URL(origin);
						if (url.hostname.endsWith(".id-131.pages.dev")) return origin;
					} catch {}
					// 不正な場合許可しない
					return "";
				}
				// dev はオウム返しして許可する
				return origin;
			},
			credentials: true,
		})(c, next);
	})
	.use((c, next) => {
		// OAuth のフロー上、クロスサイトからのリクエストが来る可能性があるため、 OAuth 関連のルートは CSRF チェックから除外する
		// csrf の secFetchSide オプションでテストしようとすると、 curl などで Origin が付与されていない場合即座に拒否されちゃうので、ここでパスベースで除外する
		// ref: https://github.com/honojs/hono/blob/8217d9ece6f4d302e446b8dc353d1b3cbf51d92e/src/middleware/csrf/index.ts#L107-L110
		if (c.req.path.startsWith("/oauth")) return next();

		return csrf({
			origin: (origin, ctx: typeof c) => {
				if (ctx.env.ENV === "production") {
					return origin === ctx.env.CLIENT_ORIGIN;
				}
				if (ctx.env.ENV === "preview") {
					return origin.endsWith(".id-131.pages.dev");
				}
				return true;
			},
			secFetchSite: (secFetchSite, ctx: typeof c) => {
				if (ctx.env.ENV === "preview") {
					// preview では frontend と backend が異なるオリジンになるため、 secFetchSite が cross-site でも許可する
					if (secFetchSite === "cross-site") return true;
				}
				// GET 以外は基本的に frontend からのリクエストであるはずなので、 secFetchSite が same-origin または same-site であれば許可する
				return secFetchSite === "same-origin" || secFetchSite === "same-site";
			},
		})(c, next);
	})
	.route("/auth", authRoute)
	.route("/user", userRoute)
	.route("/member", memberRoute)
	.route("/oauth", oauthRoute)
	.route("/admin", adminRoute)
	.route("/calendar", calendarRoute)
	.route("/certification", certificationRoute)
	.route("/equipment", equipmentRoute)
	.route("/invite", inviteRoute)
	.route("/public", publicRoute)
	.route("/discord", discordRoute)
	.route("/dev", devRoute)
	.route("/.well-known", wellKnownRoute);

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
