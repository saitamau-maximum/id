import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JWT_ALG } from "../constants/jwt";
import { ROLE_IDS } from "../constants/role";
import type { HonoEnv } from "../factory";
import { createMockUserRepository } from "../mocks/repository/user";
import type { IUserRepository } from "../repository/user";
import { userRoute } from "./user";

const TEST_SECRET = "test-secret-key";
const TEST_USER_ID = "test-user-id";

const DEFAULT_USER_PROFILE_FOR_REGISTER = {
	displayName: "Test User",
	realName: "テスト ユーザー",
	realNameKana: "てすと ゆーざー",
	displayId: "test_user_123",
	email: "foo@bar.test",
	academicEmail: "invalid@ms.saitama-u.ac.jp",
	studentId: "12AB345",
	grade: "B1",
	faculty: "工学部",
	department: "情報工学科",
	laboratory: "テスト研究室",
	graduateSchool: "テスト大学院",
	specialization: "テスト専攻",
};

const DEFAULT_USER_PROFILE_FOR_UPDATE = {
	...DEFAULT_USER_PROFILE_FOR_REGISTER,
	bio: "これはテストユーザープロフィールです。",
	socialLinks: ["https://github.com/saitamau-maximum"],
};

const createJWT = async (userId: string) => {
	return await sign({ userId: userId }, TEST_SECRET, JWT_ALG);
};

describe("User Handler", () => {
	let app: Hono<HonoEnv>;
	let mockUserRepository: IUserRepository;

	beforeEach(() => {
		app = new Hono<HonoEnv>();
		mockUserRepository = createMockUserRepository();

		// 環境変数とリポジトリを注入するミドルウェア
		const repositoryInjector = createMiddleware<HonoEnv>(async (c, next) => {
			c.set("UserRepository", mockUserRepository);

			// テスト用の環境変数
			c.env = {
				...c.env,
				SECRET: TEST_SECRET,
			};

			await next();
		});

		app.use(repositoryInjector);
		app.route("/user", userRoute);
	});

	describe("POST /user/register", () => {
		it("should register a new user with valid JWT token", async () => {
			// JWT トークンを生成
			const token = await createJWT(TEST_USER_ID);

			const response = await app.request("/user/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(DEFAULT_USER_PROFILE_FOR_REGISTER),
			});

			expect(response.status).toBe(201);
			expect(mockUserRepository.registerUser).toHaveBeenCalledWith(
				TEST_USER_ID,
				expect.objectContaining(DEFAULT_USER_PROFILE_FOR_REGISTER),
			);
		});

		it("should return 401 for invalid JWT token", async () => {
			const response = await app.request("/user/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer invalid-token`,
				},
				body: JSON.stringify(DEFAULT_USER_PROFILE_FOR_REGISTER),
			});

			expect(response.status).toBe(401);
		});
	});

	describe("PUT /user/update", () => {
		beforeEach(() => {
			// member じゃないと更新できないので、常に MEMBER ロールを返すようにする
			vi.mocked(mockUserRepository.fetchRolesByUserId).mockResolvedValue([
				ROLE_IDS.MEMBER,
			]);
		});

		it("should update user profile with valid JWT token", async () => {
			// JWT トークンを生成
			const token = await createJWT(TEST_USER_ID);

			const response = await app.request("/user/update", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(DEFAULT_USER_PROFILE_FOR_UPDATE),
			});

			expect(response.status).toBe(204);
			expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
				TEST_USER_ID,
				expect.objectContaining(DEFAULT_USER_PROFILE_FOR_UPDATE),
			);
		});

		it("should return 401 for invalid JWT token", async () => {
			const response = await app.request("/user/update", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer invalid-token`,
				},
				body: JSON.stringify(DEFAULT_USER_PROFILE_FOR_REGISTER),
			});

			expect(response.status).toBe(401);
		});

		it("should return 403 for user without member role", async () => {
			// MEMBER ロールを返さないようにする
			vi.mocked(mockUserRepository.fetchRolesByUserId).mockResolvedValue([]);
			const token = await createJWT(TEST_USER_ID);

			const response = await app.request("/user/update", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(DEFAULT_USER_PROFILE_FOR_UPDATE),
			});

			expect(response.status).toBe(403);
		});
	});

	// TODO: GET /user/contributions
	// TODO: PUT /user/profile-image
	// TODO: DELETE /user/oauth-connection/:providerId
	// TODO: GET /user/profile-image/:userId
});
