import {
	BAD_REQUEST_RESPONSE,
	UNAUTHORIZED_RESPONSE,
} from "../constants/oauth-external";
import { factory } from "../factory";

const AUTHORIZATION_REGEX = /^Bearer (.+)$/;

export const authByAccessTokenMiddleware = factory.createMiddleware(
	async (c, next) => {
		const authorization = c.req.header("Authorization");
		const accessToken = authorization?.match(AUTHORIZATION_REGEX)?.[1];
		if (!accessToken) {
			return c.text(...BAD_REQUEST_RESPONSE);
		}

		const tokenInfo =
			await c.var.OAuthExternalRepository.getTokenByAccessToken(accessToken);

		if (!tokenInfo) {
			return c.text(...UNAUTHORIZED_RESPONSE);
		}

		c.set("tokenInfo", tokenInfo);

		await next();
	},
);
