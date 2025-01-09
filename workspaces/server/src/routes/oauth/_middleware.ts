import type { MiddlewareHandler } from "hono";
import type { HonoEnv } from "../../factory";

const AUTHORIZATION_REGEX = /^Bearer (.+)$/;

export const authMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
	const authorization = c.req.header("Authorization");
	const accessToken = authorization?.match(AUTHORIZATION_REGEX)?.[1];
	if (!accessToken) {
		return c.text("Unauthorized", 401);
	}

	const tokenInfo =
		await c.var.OauthRepository.getTokenByAccessToken(accessToken);

	if (!tokenInfo) {
		return c.text("Unauthorized", 401);
	}

	c.set("tokenInfo", tokenInfo);

	await next();
};
