import type { AppType } from "@idp/server/shared/client";
import { hc } from "hono/client";
import { env } from "./env";

export const client = hc<AppType>(env("SERVER_HOST"), {
	fetch: async (...args: Parameters<typeof fetch>) => {
		const [input, init] = args;
		return fetch(input, { ...init, credentials: "include" });
	},
});
