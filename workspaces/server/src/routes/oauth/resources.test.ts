// WIP
import { env } from "cloudflare:test";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { afterEach, beforeEach, describe, vi } from "vitest";
import { oauthRoute } from ".";
import { SCOPE_IDS } from "../../constants/scope";
import type { HonoEnv } from "../../factory";
import { CloudflareOAuthExternalRepository } from "../../infrastructure/repository/cloudflare/oauth-external";
import { CloudflareUserRepository } from "../../infrastructure/repository/cloudflare/user";
import {
	type ResourcesOAuth2TestParams,
	getAccessToken as _getAccessToken,
	resourcesOAuth2Test,
} from "../../tests/oauth/resources-tests";

describe("authuser Handler", () => {
	let app: Hono<HonoEnv>;

	const oauthExternalRepository = new CloudflareOAuthExternalRepository(env.DB);
	const userRepository = new CloudflareUserRepository(env.DB);

	const oauth2CommonTestParams: Partial<ResourcesOAuth2TestParams> = {
		oauthExternalRepository,
		userRepository,
		clientScopes: [SCOPE_IDS.READ_BASIC_INFO],
		path: "/oauth/resources/authuser",
	};

	beforeEach(async () => {
		vi.useFakeTimers();

		app = new Hono<HonoEnv>();
		oauth2CommonTestParams.app = app;

		// 環境変数とリポジトリを注入するミドルウェア
		const repositoryInjector = createMiddleware<HonoEnv>(async (c, next) => {
			c.env = env;
			c.set("OAuthExternalRepository", oauthExternalRepository);
			c.set("UserRepository", userRepository);
			await next();
		});

		app.use(repositoryInjector).route("/oauth", oauthRoute);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// 直接 params を渡そうとすると vitest の実行タイミング的に app が undefined になるので、 oauth2CommonTestParams の参照渡しをする
	// (it が呼ばれるときに beforeEach が実行されて app がセットされるが、これを呼んだタイミングでは beforeEach は実行されてないので)
	resourcesOAuth2Test(oauth2CommonTestParams as ResourcesOAuth2TestParams);

	// wrapper
	const getAccessToken = async () => {
		return await _getAccessToken({
			oauthExternalRepository,
			userRepository,
			clientScopes: [SCOPE_IDS.READ_BASIC_INFO],
			app,
		});
	};
});
