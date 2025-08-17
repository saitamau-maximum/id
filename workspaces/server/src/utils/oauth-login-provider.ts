// OAuth によるログインフローを共通化するためのクラス

import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";

interface OAuthLoginProviderOptions {
	enableInvitation?: boolean;
}

/**
 * @example
 * ```typescript
 * const provider = new OAuthLoginProvider(options);
 *
 * const route = app
 *   .get("/", ...provider.getLoginHandler())
 *   .get("/callback", ...provider.getCallbackHandler());
 * ```
 */
export class OAuthLoginProvider {
	static readonly JWT_EXPIRATION = 60 * 60 * 24 * 7; // 1 week

	static readonly COOKIE_OPTIONS = {
		path: "/",
		secure: true, // localhost は特別扱いされるので、常に true にしても問題ない
		sameSite: "lax", // "strict" にすると callback で読み取れなくなる
		httpOnly: true,
		maxAge: OAuthLoginProvider.JWT_EXPIRATION,
	};

	static readonly CALLBACK_REQUEST_QUERY_SCHEMA = v.object({
		code: v.pipe(v.string(), v.nonEmpty()),
		state: v.pipe(v.string(), v.nonEmpty()),
	});

	static readonly LOGIN_REQUEST_QUERY_SCHEMA = v.object({
		continue_to: v.string(),
		invitation_id: v.optional(v.string()),
	});

	private options: OAuthLoginProviderOptions;

	constructor(options: OAuthLoginProviderOptions) {
		this.options = options;
	}

	getLoginHandlers() {
		return factory.createHandlers(
			vValidator("query", OAuthLoginProvider.LOGIN_REQUEST_QUERY_SCHEMA),
			async (c) => {},
		);
	}

	getCallbackHandlers() {
		return factory.createHandlers(
			vValidator("query", OAuthLoginProvider.CALLBACK_REQUEST_QUERY_SCHEMA),
			async (c) => {},
		);
	}
}
