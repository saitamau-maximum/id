import { every } from "hono/combine";
import { getSignedCookie } from "hono/cookie";
import { jwt, verify } from "hono/jwt";
import { COOKIE_NAME } from "../constants/cookie";
import { ROLE_IDS } from "../constants/role";
import {
	PLEASE_LOGIN_FOR_OAUTH,
	TOAST_SEARCHPARAM,
	ToastHashFn,
} from "../constants/toast";
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
			const payload = await verify(jwt, c.env.SECRET).catch(() => undefined);
			if (payload) {
				c.set("jwtPayload", payload);
				return next();
			}
		}

		const requestUrl = new URL(c.req.url);

		const redirectTo = new URL("/login", c.env.CLIENT_ORIGIN);
		redirectTo.searchParams.set("continue_to", requestUrl.toString());
		// どうせ OAuth でしか使ってないのでこのメッセージ
		redirectTo.searchParams.set(
			TOAST_SEARCHPARAM,
			ToastHashFn(PLEASE_LOGIN_FOR_OAUTH),
		);

		return c.redirect(redirectTo.toString(), 302);
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

		c.set("roleIds", roleIds);

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

export const calendarMutableMiddleware = every(
	authMiddleware,
	roleAuthorizationMiddleware({
		ALLOWED_ROLES: [ROLE_IDS.ADMIN, ROLE_IDS.CALENDAR_EDITOR],
	}),
);

export const invitesMutableMiddleware = every(
	authMiddleware,
	roleAuthorizationMiddleware({
		ALLOWED_ROLES: [ROLE_IDS.ADMIN, ROLE_IDS.ACCOUNTANT],
	}),
);

export const equipmentMutableMiddleware = every(
	authMiddleware,
	roleAuthorizationMiddleware({
		ALLOWED_ROLES: [ROLE_IDS.ADMIN, ROLE_IDS.ACCOUNTANT],
	}),
);
