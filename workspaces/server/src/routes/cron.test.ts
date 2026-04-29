import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import type { HonoEnv } from "../factory";
import { CronTriggerAuthMiddleware } from "./cron";

describe("Cron Trigger Auth Middleware", () => {
	let app: Hono<HonoEnv>;
	const TEST_TOKEN = "test-cron-token";

	beforeEach(() => {
		app = new Hono<HonoEnv>();
		app.post("/cron", CronTriggerAuthMiddleware, (c) => c.text("OK"));
	});

	const makeRequestBase = ({
		reqToken,
		env,
	}: {
		reqToken?: string;
		env: Partial<Env>;
	}) => {
		const headers = new Headers();
		if (reqToken) headers.set("X-Cron-Trigger-Token", reqToken);
		return app.request("/cron", { headers, method: "POST" }, env);
	};

	describe("Env: development", () => {
		const makeRequest = (reqToken?: string, envToken?: string) =>
			makeRequestBase({
				reqToken,
				env: {
					ENV: "development",
					CRON_TRIGGER_TOKEN: envToken,
				},
			});

		it("should execute cron job with correct token", async () => {
			const res = await makeRequest(TEST_TOKEN, TEST_TOKEN);
			expect(res.status).toBe(200);
		});

		it("should return 200 even if token is wrong", async () => {
			const res = await makeRequest("wrong-token", TEST_TOKEN);
			expect(res.status).toBe(200);
		});

		it("should return 200 even if token is not set", async () => {
			const res = await makeRequest(undefined, TEST_TOKEN);
			expect(res.status).toBe(200);
		});

		it("should return 200 even if env token is not set", async () => {
			const res = await makeRequest(TEST_TOKEN, undefined);
			expect(res.status).toBe(200);
		});
	});

	describe("Env: production", () => {
		const makeRequest = (reqToken?: string, envToken?: string) =>
			makeRequestBase({
				reqToken,
				env: {
					ENV: "production",
					CRON_TRIGGER_TOKEN: envToken,
				},
			});

		it("should execute cron job with correct token", async () => {
			const res = await makeRequest(TEST_TOKEN, TEST_TOKEN);
			expect(res.status).toBe(200);
		});

		it("should return 401 if token is wrong", async () => {
			const res = await makeRequest("wrong-token", TEST_TOKEN);
			expect(res.status).toBe(401);
		});

		it("should return 401 if token is not set", async () => {
			const res = await makeRequest(undefined, TEST_TOKEN);
			expect(res.status).toBe(401);
		});

		it("should return 500 if env token is not set", async () => {
			const res = await makeRequest(TEST_TOKEN, undefined);
			expect(res.status).toBe(500);
		});
	});
});
