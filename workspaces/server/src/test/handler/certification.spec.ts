import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HonoEnv } from "../../factory";
import type {
	ICertification,
	ICertificationRepository,
} from "../../repository/certification";
import type { IUserRepository } from "../../repository/user";
import { certificationRoute } from "../../routes/certification";
import { createMockCertificationRepository } from "../mocks/repository/certification";
import { createMockUserRepository } from "../mocks/repository/user";

const TEST_SECRET = "test-secret-key";

const createJWTToken = async (userId: string) => {
	return await sign({ userId: userId }, TEST_SECRET);
};

describe("Certification Handler", () => {
	let app: Hono<HonoEnv>;
	let mockCertificationRepository: ICertificationRepository;
	let mockUserRepository: IUserRepository;

	beforeEach(() => {
		app = new Hono<HonoEnv>();
		mockCertificationRepository = createMockCertificationRepository();
		mockUserRepository = createMockUserRepository();

		// 環境変数とリポジトリを注入するミドルウェア
		const repositoryInjector = createMiddleware<HonoEnv>(async (c, next) => {
			c.set("CertificationRepository", mockCertificationRepository);
			c.set("UserRepository", mockUserRepository);

			// テスト用の環境変数
			c.env = {
				...c.env,
				SECRET: TEST_SECRET,
			};

			await next();
		});

		app.use(repositoryInjector);
		app.route("/certification", certificationRoute);
	});

	describe("GET /certification/all", () => {
		it("should get all certifications", async () => {
			const mockData: ICertification[] = [
				{
					id: "1",
					title: "Certification 1",
					description: "Description 1",
				},
				{
					id: "2",
					title: "Certification 2",
					description: "Description 2",
				},
			];

			vi.mocked(
				mockCertificationRepository.getAllCertifications,
			).mockResolvedValue(mockData);

			const response = await app.request("/certification/all");
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual(mockData);
		});

		it("should return empty array when no certifications exist", async () => {
			vi.mocked(
				mockCertificationRepository.getAllCertifications,
			).mockResolvedValue([]);

			const response = await app.request("/certification/all");
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual([]);
		});

		it("should handle errors gracefully", async () => {
			vi.mocked(
				mockCertificationRepository.getAllCertifications,
			).mockRejectedValue(new Error("Database error"));
			const response = await app.request("/certification/all");

			expect(response.status).toBe(500);
		});
	});
});
