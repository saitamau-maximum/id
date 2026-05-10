import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HonoEnv } from "../factory";
import { registerGithubWebhookHandlers } from "../webhooks-handler/github";
import { webhookRoute } from "./webhook";

vi.mock("../webhooks-handler/github", () => ({
	registerGithubWebhookHandlers: vi.fn(),
}));

describe("Webhook Handler", () => {
	let app: Hono<HonoEnv>;

	beforeEach(() => {
		app = new Hono<HonoEnv>();
		app.route("/webhook", webhookRoute);
	});

	describe("GitHub", () => {
		beforeEach(() => {
			vi.clearAllMocks();
			vi.mocked(registerGithubWebhookHandlers).mockImplementation(() => {});
		});

		it("should return 500 if GITHUB_WEBHOOK_SECRET is not set", async () => {
			const response = await app.request("/webhook/github", {
				method: "POST",
			});
			expect(response.status).toBe(500);
		});

		it("should return 400 if required headers are missing", async () => {
			const response = await app.request(
				"/webhook/github",
				{
					method: "POST",
					headers: {},
					body: JSON.stringify({ test: "payload" }),
				},
				{
					GITHUB_WEBHOOK_SECRET: "test-secret",
				},
			);
			expect(response.status).toBe(400);
		});

		it("should return 401 if signature verification fails", async () => {
			const response = await app.request(
				"/webhook/github",
				// https://github.com/octokit/webhooks-methods.js/blob/main/test/sign.test.ts
				{
					method: "POST",
					headers: {
						"x-github-delivery": "test-id",
						"x-github-event": "ping",
						"x-hub-signature-256":
							"sha256=4864d2759938a15468b5df9ade20bf161da9b4f737ea61794142f3484236bda3",
					},
					body: JSON.stringify({ foo: "barbaz" }),
				},
				{
					GITHUB_WEBHOOK_SECRET: "mysecret",
				},
			);
			expect(response.status).toBe(401);
		});

		it("should return 204 if everything is correct", async () => {
			const response = await app.request(
				"/webhook/github",
				{
					method: "POST",
					headers: {
						"x-github-delivery": "test-id",
						"x-github-event": "ping",
						"x-hub-signature-256":
							"sha256=4864d2759938a15468b5df9ade20bf161da9b4f737ea61794142f3484236bda3",
					},
					body: JSON.stringify({ foo: "bar" }),
				},
				{
					GITHUB_WEBHOOK_SECRET: "mysecret",
				},
			);
			expect(response.status).toBe(204);
		});

		it("should return 500 for server errors in handler", async () => {
			vi.mocked(registerGithubWebhookHandlers).mockImplementation(() => {
				throw new Error("Handler error");
			});

			const response = await app.request(
				"/webhook/github",
				{
					method: "POST",
					headers: {
						"x-github-delivery": "test-id",
						"x-github-event": "ping",
						"x-hub-signature-256":
							"sha256=4864d2759938a15468b5df9ade20bf161da9b4f737ea61794142f3484236bda3",
					},
					body: JSON.stringify({ foo: "bar" }),
				},
				{
					GITHUB_WEBHOOK_SECRET: "mysecret",
				},
			);
			expect(response.status).toBe(500);
		});
	});
});
