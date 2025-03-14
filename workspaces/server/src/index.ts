import { createAppAuth } from "@octokit/auth-app";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Octokit } from "octokit";
import { factory } from "./factory";
import { CloudflareContributionCacheRepository } from "./infrastructure/repository/cloudflare/cache";
import { CloudflareCalendarRepository } from "./infrastructure/repository/cloudflare/calendar";
import { CloudflareCertificationRepository } from "./infrastructure/repository/cloudflare/certification";
import { CloudflareOAuthAppRepository } from "./infrastructure/repository/cloudflare/oauth-app-storage";
import { CloudflareOAuthExternalRepository } from "./infrastructure/repository/cloudflare/oauth-external";
import { CloudflareOAuthInternalRepository } from "./infrastructure/repository/cloudflare/oauth-internal";
import { CloudflareSessionRepository } from "./infrastructure/repository/cloudflare/session";
import { CloudflareUserRepository } from "./infrastructure/repository/cloudflare/user";
import { CloudflareUserStorageRepository } from "./infrastructure/repository/cloudflare/user-storage";
import { GithubContributionRepository } from "./infrastructure/repository/github/contribution";
import { GithubOrganizationRepository } from "./infrastructure/repository/github/organization";
import { adminRoute } from "./routes/admin";
import { authRoute } from "./routes/auth";
import { calendarRoute } from "./routes/calendar";
import { certificationRoute } from "./routes/certification";
import { memberRoute } from "./routes/member";
import { oauthRoute } from "./routes/oauth";
import { userRoute } from "./routes/user";

const app = factory.createApp();

export const route = app
	.use(logger())
	.use(async (c, next) => {
		c.set(
			"SessionRepository",
			new CloudflareSessionRepository(c.env.IDP_SESSION),
		);

		c.set("UserRepository", new CloudflareUserRepository(c.env.DB));
		c.set(
			"OAuthExternalRepository",
			new CloudflareOAuthExternalRepository(c.env.DB),
		);
		c.set(
			"OAuthInternalRepository",
			new CloudflareOAuthInternalRepository(c.env.DB),
		);
		c.set("CalendarRepository", new CloudflareCalendarRepository(c.env.DB));
		c.set(
			"CertificationRepository",
			new CloudflareCertificationRepository(c.env.DB),
		);

		c.set(
			"ContributionCacheRepository",
			new CloudflareContributionCacheRepository(c.env.CACHE),
		);
		c.set(
			"UserStorageRepository",
			new CloudflareUserStorageRepository(c.env.STORAGE),
		);
		c.set(
			"OAuthAppStorageRepository",
			new CloudflareOAuthAppRepository(c.env.STORAGE),
		);

		const octokit = new Octokit({
			authStrategy: createAppAuth,
			auth: {
				appId: c.env.GITHUB_APP_ID,
				privateKey: atob(c.env.GITHUB_APP_PRIVKEY),
				installationId: c.env.GITHUB_APP_INSTALLID,
			},
		});
		c.set("ContributionRepository", new GithubContributionRepository(octokit));
		c.set("OrganizationRepository", new GithubOrganizationRepository(octokit));

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
	.route("/certification", certificationRoute);

export default app;
