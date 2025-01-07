import { vValidator } from "@hono/valibot-validator";
import { getCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import * as v from "valibot";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";

type MaximumTokenResponse = {
	access_token: string;
	expires_in: number;
	scope: string;
	token_type: string;
	id_token: string;
};

type MaximumTokenVerifyResponse = {
	valid: boolean;
	client: {
		id: string;
		name: string;
		description: string;
		logo_url: string | null;
		owner_id: string;
	};
	user_id: string;
	expires_at: string;
	scopes: string[];
	user_info: MaximumUser;
};

type MaximumUser = {
	id: string;
	display_name: string;
	profile_image_url: string;
};

const app = factory.createApp();
const USER_AGENT = "Maximum IDP Server";
const BASE_OAUTH_URL = "https://auth.maximum.vc/oauth";
const JWT_EXPIRATION = 60 * 60 * 24 * 7; // 1 week
const PROVIDER_IDENTIFIER = "maximum";
const STATE_COOKIE_NAME = "oauth_state";

const fetchUserData = async (token: string) => {
	const response = await fetch(`${BASE_OAUTH_URL}/verify-token`, {
		headers: {
			Authorization: `Bearer ${token}`,
			"User-Agent": USER_AGENT,
		},
	});

	if (!response.ok) {
		return null;
	}

	return response.json<MaximumTokenVerifyResponse>();
};

const callbackRequestQuerySchema = v.object({
	code: v.pipe(v.string(), v.nonEmpty()),
	state: v.pipe(v.string(), v.nonEmpty()),
});

const verifyRequestQuerySchema = v.object({
	ott: v.pipe(v.string(), v.nonEmpty()),
});

// oauth flow to maximum
const route = app
	.get("/login", async (c) => {
		const state = Math.random().toString(36).substring(2, 15);
		const { MAXIMUM_AUTH_ID } = c.env;
		const searchParams = new URLSearchParams();
		searchParams.set("response_type", "code");
		searchParams.set("client_id", MAXIMUM_AUTH_ID);
		searchParams.set("state", state);
		const requestUrl = new URL(c.req.url);
		searchParams.set("redirect_uri", `${requestUrl.origin}/auth/callback`);
		const redirectUrl = `${BASE_OAUTH_URL}/authorize?${searchParams.toString()}`;
		setCookie(c, STATE_COOKIE_NAME, state, {
			path: "/",
			httpOnly: true,
			secure: true,
		});
		return c.redirect(redirectUrl);
	})
	.get("/login-tmp", async (c) => {
		// oauthが死んでいるので一時的にログインを許可する
		const { SessionRepository, UserRepository } = c.var;

		let foundUserId = null;
		try {
			// ユーザーが存在するか確認
			const res = await UserRepository.fetchUserByProviderInfo(
				"dummy-user-id",
				PROVIDER_IDENTIFIER,
			);
			foundUserId = res.id;
		} catch (e) {
			// もしユーザーが見つからなかったら新規作成
			foundUserId = await UserRepository.createUser(
				"dummy-user-id",
				PROVIDER_IDENTIFIER,
				{
					displayName: "sor4chi",
					profileImageURL: "https://github.com/sor4chi.png",
				},
			);
		}

		const now = Math.floor(Date.now() / 1000);
		const jwt = await sign(
			{
				userId: foundUserId,
				iat: now,
				exp: now + JWT_EXPIRATION,
			},
			c.env.JWT_SECRET,
		);

		const ott = crypto.getRandomValues(new Uint8Array(32)).join("");

		await SessionRepository.storeOneTimeToken(ott, jwt, JWT_EXPIRATION);

		return c.redirect(`${c.env.CLIENT_REDIRECT_URL}?ott=${ott}`);
	})
	.get(
		"/callback",
		vValidator("query", callbackRequestQuerySchema),
		async (c) => {
			const { SessionRepository, UserRepository } = c.var;
			const { code, state } = c.req.valid("query");
			const storedState = getCookie(c, STATE_COOKIE_NAME);

			if (state !== storedState) {
				return c.redirect(`${c.req.path.replace("callback", "login")}`);
			}

			const { MAXIMUM_AUTH_ID, MAXIMUM_AUTH_SECRET } = c.env;
			const formData = new FormData();
			formData.append("client_id", MAXIMUM_AUTH_ID);
			formData.append("client_secret", MAXIMUM_AUTH_SECRET);
			formData.append("code", code);
			formData.append("grant_type", "authorization_code");

			const tokenResponse = await fetch(`${BASE_OAUTH_URL}/access-token`, {
				method: "POST",
				headers: {
					"User-Agent": USER_AGENT,
				},
				body: formData,
			});

			if (!tokenResponse.ok) {
				return c.redirect(`${c.req.path.replace("callback", "login")}`);
			}

			const token = await tokenResponse.json<MaximumTokenResponse>();
			const userData = await fetchUserData(token.access_token);

			if (!userData) {
				return c.redirect(`${c.req.path.replace("callback", "login")}`);
			}

			let foundUserId = null;
			try {
				// ユーザーが存在するか確認
				const res = await UserRepository.fetchUserByProviderInfo(
					userData.user_id,
					PROVIDER_IDENTIFIER,
				);
				foundUserId = res.id;
			} catch (e) {
				// もしユーザーが見つからなかったら新規作成
				foundUserId = await UserRepository.createUser(
					userData.user_id,
					PROVIDER_IDENTIFIER,
					{
						displayName: userData.user_info.display_name,
						profileImageURL: userData.user_info.profile_image_url,
					},
				);
			}

			const now = Math.floor(Date.now() / 1000);
			const jwt = await sign(
				{
					userId: foundUserId,
					iat: now,
					exp: now + JWT_EXPIRATION,
				},
				c.env.JWT_SECRET,
			);

			const ott = crypto.getRandomValues(new Uint8Array(32)).join("");

			await SessionRepository.storeOneTimeToken(ott, jwt, JWT_EXPIRATION);

			return c.redirect(`${c.env.CLIENT_REDIRECT_URL}?ott=${ott}`);
		},
	)
	.get("/verify", vValidator("query", verifyRequestQuerySchema), async (c) => {
		const { SessionRepository } = c.var;
		const { ott } = c.req.valid("query");

		const jwt = await SessionRepository.verifyOneTimeToken(ott);

		if (!jwt) {
			return c.json({ error: "invalid ott" }, 400);
		}

		return c.json({ jwt });
	})
	.get("/me", authMiddleware, async (c) => {
		const payload = c.get("jwtPayload");
		const { UserRepository } = c.var;
		try {
			const res = await UserRepository.fetchUserById(payload.userId);
			return c.json(res);
		} catch (e) {
			return c.json({ error: "user not found" }, 404);
		}
	});

export { route as authRoute };
