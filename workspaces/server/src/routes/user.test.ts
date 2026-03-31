import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it, test, vi } from "vitest";
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
	socialLinks: ["https://example.com"],
};

// [description, payload, flag][]
const INVALID_PAYLOADS = [
	["absent displayName", { displayName: undefined }, 3],
	["empty displayName", { displayName: "" }, 3],
	["absent realName", { realName: undefined }, 3],
	["empty realName", { realName: "" }, 3],
	["realName w/o spaces", { realName: "テストユーザー" }, 3],
	["absent realNameKana", { realNameKana: undefined }, 3],
	["empty realNameKana", { realNameKana: "" }, 3],
	["realNameKana w/o spaces", { realNameKana: "てすとゆーざー" }, 3],
	["absent displayId", { displayId: undefined }, 3],
	["empty displayId", { displayId: "" }, 3],
	["too short displayId", { displayId: "a" }, 3],
	["too long displayId", { displayId: "a".repeat(17) }, 3],
	["only underscores in displayId", { displayId: "_____" }, 3],
	["uppercase displayId", { displayId: "ABC" }, 3],
	["invalid characters in displayId", { displayId: "test-user!" }, 3],
	["absent email", { email: undefined }, 3],
	["empty email", { email: "" }, 3],
	["invalid email", { email: "invalid-email" }, 3],
	["absent academicEmail (non-guest)", { academicEmail: undefined }, 3],
	["empty academicEmail", { academicEmail: "" }, 3],
	["academicEmail in email field", { email: "invalid@ms.saitama-u.ac.jp" }, 3],
	["normal email in academicEmail field", { academicEmail: "foo@bar.test" }, 3],
	["absent studentId (non-guest)", { studentId: undefined }, 3],
	["empty studentId", { studentId: "" }, 3],
	["invalid studentId (1)", { studentId: "1234567" }, 3],
	["invalid studentId (2)", { studentId: "1A34567" }, 3],
	["too long bio", { bio: "a".repeat(301) }, 2],
	[
		"too many socialLinks",
		{ socialLinks: new Array(6).fill("https://example.com") },
		2,
	],
] satisfies [string, Record<string, unknown>, 1 | 2 | 3][];

const VALID_PAYLOADS = [
	[
		"no academicEmail and studentId for Guest",
		{ grade: "ゲスト", academicEmail: undefined, studentId: undefined },
		3,
	],
	[
		"no academicEmail and studentId for Graduate",
		{ grade: "卒業生", academicEmail: undefined, studentId: undefined },
		3,
	],
	["no socialLinks", { socialLinks: [] }, 2],
] satisfies [string, Record<string, unknown>, 1 | 2 | 3][];

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

		it.each(
			INVALID_PAYLOADS.filter(([, , flag]) => flag & 1),
		)("should return 400 for invalid input: %s", async (_description, invalidPayload, _flag) => {
			const token = await createJWT(TEST_USER_ID);

			const response = await app.request("/user/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...DEFAULT_USER_PROFILE_FOR_REGISTER,
					...invalidPayload,
				}),
			});

			expect(response.status).toBe(400);
		});

		it.each(
			VALID_PAYLOADS.filter(([, , flag]) => flag & 1),
		)("should return 201 for valid input: %s", async (_description, validPayload, _flag) => {
			const token = await createJWT(TEST_USER_ID);

			const response = await app.request("/user/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...DEFAULT_USER_PROFILE_FOR_REGISTER,
					...validPayload,
				}),
			});

			expect(response.status).toBe(201);
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

		it.each(
			INVALID_PAYLOADS.filter(([, , flag]) => flag & 2),
		)("should return 400 for invalid input: %s", async (_description, invalidPayload, _flag) => {
			const token = await createJWT(TEST_USER_ID);

			const response = await app.request("/user/update", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...DEFAULT_USER_PROFILE_FOR_UPDATE,
					...invalidPayload,
				}),
			});

			expect(response.status).toBe(400);
		});

		it.each(
			VALID_PAYLOADS.filter(([, , flag]) => flag & 2),
		)("should return 204 for valid input: %s", async (_description, validPayload, _flag) => {
			const token = await createJWT(TEST_USER_ID);

			const response = await app.request("/user/update", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...DEFAULT_USER_PROFILE_FOR_UPDATE,
					...validPayload,
				}),
			});

			expect(response.status).toBe(204);
		});
	});

	test.todo("GET /user/contributions");
	test.todo("PUT /user/profile-image");
	test.todo("DELETE /user/oauth-connection/:providerId");
	test.todo("GET /user/profile-image/:userId");
});
