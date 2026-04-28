import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HonoEnv } from "../factory";
import { createMockOAuthExternalRepository } from "../mocks/repository/oauth-external";
import { cronRoute } from "./cron";

describe("Cron Handler", () => {
	let app: Hono<HonoEnv>;
	let mockedWaitUntil: () => void;
	const TEST_TOKEN = "test-cron-token";
	const TEST_CRON_EXPRESSION = "0 3 * * *";

	const makeRequestBase = ({
		cron,
		reqToken,
		env,
	}: {
		cron?: string;
		reqToken?: string;
		env: Partial<Env>;
	}) => {
		const headers = new Headers();
		if (reqToken) headers.set("X-Cron-Trigger-Token", reqToken);

		let reqTo = "/cron";
		if (cron) reqTo += `?cron=${encodeURIComponent(cron)}`;

		mockedWaitUntil = vi.fn();

		return app.request(
			reqTo,
			{ headers },
			env,
			{
				waitUntil: mockedWaitUntil,
				passThroughOnException: vi.fn(),
				props: {},
			}, // executionCtx.waitUntil をモック
		);
	};

	beforeEach(() => {
		app = new Hono<HonoEnv>();

		const repositoryInjector = createMiddleware<HonoEnv>(async (c, next) => {
			c.set("OAuthExternalRepository", createMockOAuthExternalRepository());
			await next();
		});

		app.use(repositoryInjector);
		app.route("/cron", cronRoute);
	});

	describe("GET /cron/", () => {
		describe("Env: development", () => {
			const makeRequest = (
				cron?: string,
				reqToken?: string,
				envToken?: string,
			) =>
				makeRequestBase({
					cron,
					reqToken,
					env: {
						ENV: "development",
						CRON_TRIGGER_TOKEN: envToken,
					},
				});

			it("should execute cron job with correct token", async () => {
				const res = await makeRequest(
					TEST_CRON_EXPRESSION,
					TEST_TOKEN,
					TEST_TOKEN,
				);
				expect(res.status).toBe(200);
				expect(mockedWaitUntil).toBeCalled();
			});

			it("should return 200 even if token is wrong", async () => {
				const res = await makeRequest(
					TEST_CRON_EXPRESSION,
					"wrong-token",
					TEST_TOKEN,
				);
				expect(res.status).toBe(200);
				expect(mockedWaitUntil).toBeCalled();
			});

			it("should return 200 even if token is not set", async () => {
				const res = await makeRequest(
					TEST_CRON_EXPRESSION,
					undefined,
					TEST_TOKEN,
				);
				expect(res.status).toBe(200);
				expect(mockedWaitUntil).toBeCalled();
			});

			it("should return 200 even if env token is not set", async () => {
				const res = await makeRequest(
					TEST_CRON_EXPRESSION,
					TEST_TOKEN,
					undefined,
				);
				expect(res.status).toBe(200);
				expect(mockedWaitUntil).toBeCalled();
			});

			it("should return 400 if cron parameter is missing", async () => {
				const res = await makeRequest(undefined, TEST_TOKEN, TEST_TOKEN);
				expect(res.status).toBe(400);
				expect(mockedWaitUntil).not.toBeCalled();
			});

			it("should return 400 if cron parameter is unknown", async () => {
				const res = await makeRequest("invalid-cron", TEST_TOKEN, TEST_TOKEN);
				expect(res.status).toBe(400);
				expect(mockedWaitUntil).not.toBeCalled();
			});
		});

		describe("Env: production", () => {
			const makeRequest = (
				cron?: string,
				reqToken?: string,
				envToken?: string,
			) =>
				makeRequestBase({
					cron,
					reqToken,
					env: {
						ENV: "production",
						CRON_TRIGGER_TOKEN: envToken,
					},
				});

			it("should execute cron job with correct token", async () => {
				const res = await makeRequest(
					TEST_CRON_EXPRESSION,
					TEST_TOKEN,
					TEST_TOKEN,
				);
				expect(res.status).toBe(200);
				expect(mockedWaitUntil).toBeCalled();
			});

			it("should return 401 if token is wrong", async () => {
				const res = await makeRequest(
					TEST_CRON_EXPRESSION,
					"wrong-token",
					TEST_TOKEN,
				);
				expect(res.status).toBe(401);
				expect(mockedWaitUntil).not.toBeCalled();
			});

			it("should return 401 if token is not set", async () => {
				const res = await makeRequest(
					TEST_CRON_EXPRESSION,
					undefined,
					TEST_TOKEN,
				);
				expect(res.status).toBe(401);
				expect(mockedWaitUntil).not.toBeCalled();
			});

			it("should return 500 if env token is not set", async () => {
				const res = await makeRequest(
					TEST_CRON_EXPRESSION,
					TEST_TOKEN,
					undefined,
				);
				expect(res.status).toBe(500);
				expect(mockedWaitUntil).not.toBeCalled();
			});

			it("should return 400 if cron parameter is missing", async () => {
				const res = await makeRequest(undefined, TEST_TOKEN, TEST_TOKEN);
				expect(res.status).toBe(400);
				expect(mockedWaitUntil).not.toBeCalled();
			});

			it("should return 400 if cron parameter is unknown", async () => {
				const res = await makeRequest("invalid-cron", TEST_TOKEN, TEST_TOKEN);
				expect(res.status).toBe(400);
				expect(mockedWaitUntil).not.toBeCalled();
			});
		});
	});
});
