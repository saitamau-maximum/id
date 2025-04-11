import { every } from "hono/combine";
import { getSignedCookie } from "hono/cookie";
import { jwt, verify } from "hono/jwt";
import { COOKIE_NAME } from "../constants/cookie";
import { ROLE_IDS } from "../constants/role";
import { factory } from "../factory";

export const authMiddleware = factory.createMiddleware(async (c, next) => {
	return jwt({
		secret: c.env.SECRET,
	})(c, next);
});

export const cookieAuthMiddleware = factory.createMiddleware(
	async (c, next) => {
		const jwt = await getSignedCookie(c, c.env.SECRET, COOKIE_NAME.LOGIN_STATE);
		if (jwt) {
			const payload = await verify(jwt, c.env.SECRET);
			if (payload) {
				c.set("jwtPayload", payload);
				return next();
			}
		}

		const requestUrl = new URL(c.req.url);
		return c.redirect(
			`${c.env.CLIENT_ORIGIN}/login?continue_to=${encodeURIComponent(requestUrl.toString())}`,
		);
	},
);

interface RoleAuthorizationMiddlewareOptions {
	ALLOWED_ROLES: number[];
}

const roleAuthorizationMiddleware = (
	options: Partial<RoleAuthorizationMiddlewareOptions> = {},
) => {
	return factory.createMiddleware(async (c, next) => {
		const { userId } = c.get("jwtPayload");
		const { UserRepository } = c.var;

		const roleIds = await UserRepository.fetchRolesByUserId(userId);
		const allowedRoles = options.ALLOWED_ROLES ?? [];
		if (roleIds.some((roleId) => allowedRoles.includes(roleId))) {
			return next();
		}

		return c.text("Forbidden", 403);
	});
};

// adminもmemberを持っているという前提
export const memberOnlyMiddleware = every(
	authMiddleware,
	roleAuthorizationMiddleware({
		ALLOWED_ROLES: [ROLE_IDS.MEMBER],
	}),
);

export const adminOnlyMiddleware = every(
	authMiddleware,
	roleAuthorizationMiddleware({
		ALLOWED_ROLES: [ROLE_IDS.ADMIN],
	}),
);
