import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLE_IDS } from "../constants/role";
import type { HonoEnv } from "../factory";
import { createMockCertificationRepository } from "../mocks/repository/certification";
import { createMockUserRepository } from "../mocks/repository/user";
import type {
	ICertification,
	ICertificationRepository,
} from "../repository/certification";
import type { IUserRepository } from "../repository/user";
import { certificationRoute } from "../routes/certification";

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

	describe("POST /certification/request", () => {
		it("should request certification with valid JWT token", async () => {
			const userId = "test-user-id";
			const certificationId = "cert1";
			const certifiedIn = 2023;

			// メンバーロールを設定
			vi.mocked(mockUserRepository.fetchRolesByUserId).mockResolvedValue([
				ROLE_IDS.MEMBER,
			]);

			// JWTトークンを生成
			const token = await createJWTToken(userId);

			const response = await app.request("/certification/request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					certificationId,
					certifiedIn,
				}),
			});

			expect(response.status).toBe(201);
			expect(
				mockCertificationRepository.requestCertification,
			).toHaveBeenCalledWith({
				userId,
				certificationId,
				certifiedIn,
			});
			expect(mockUserRepository.fetchRolesByUserId).toHaveBeenCalledWith(
				userId,
			);
		});

		it("should return 403 for user without member role", async () => {
			const userId = "test-user-id";
			const certificationId = "cert1";
			const certifiedIn = 2023;

			// ロールを設定しない
			vi.mocked(mockUserRepository.fetchRolesByUserId).mockResolvedValue([]);

			const token = await createJWTToken(userId);

			const response = await app.request("/certification/request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					certificationId,
					certifiedIn,
				}),
			});

			expect(response.status).toBe(403);
		});

		it("should return 401 for invalid JWT token", async () => {
			const response = await app.request("/certification/request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer invalid-token",
				},
				body: JSON.stringify({
					certificationId: "cert1",
					certifiedIn: 2023,
				}),
			});

			expect(response.status).toBe(401);
		});
	});

	describe("GET /certification/request", () => {
		it("should get all certification requests with admin authentication", async () => {
			const userId = "admin-user";
			const mockRequests = [
				{
					userId: "user1",
					certificationId: "cert1",
					certifiedIn: 2023,
					user: {
						id: "user1",
						displayId: "testuser",
						displayName: "Test User",
						profileImageURL: "https://example.com/image.jpg",
					},
				},
			];

			// adminロールを設定
			vi.mocked(mockUserRepository.fetchRolesByUserId).mockResolvedValue([
				ROLE_IDS.ADMIN,
			]);
			vi.mocked(
				mockCertificationRepository.getAllCertificationRequests,
			).mockResolvedValue(mockRequests);

			const token = await createJWTToken(userId);

			const response = await app.request("/certification/request", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual(mockRequests);
			expect(mockUserRepository.fetchRolesByUserId).toHaveBeenCalledWith(
				userId,
			);
		});

		it("should return 403 for non-admin user", async () => {
			const userId = "regular-user";

			// メンバーロールを設定
			vi.mocked(mockUserRepository.fetchRolesByUserId).mockResolvedValue([
				ROLE_IDS.MEMBER,
			]);

			const token = await createJWTToken(userId);

			const response = await app.request("/certification/request", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			expect(response.status).toBe(403);
		});
	});
});
