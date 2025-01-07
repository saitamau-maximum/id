import type { AppType } from "@idp/server";
import { hc } from "hono/client";
import { JWT_STORAGE_KEY } from "~/constant";
import { env } from "./env";

export const client = hc<AppType>(env("SERVER_HOST"), {
	fetch: async (...args: Parameters<typeof fetch>) => {
		const [input, init] = args;
		const jwt = localStorage.getItem(JWT_STORAGE_KEY);
		const headers = new Headers(init?.headers);
		if (jwt) {
			headers.set("Authorization", `Bearer ${jwt}`);
		}
		return fetch(input, { ...init, headers });
	},
});
