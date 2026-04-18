import { ROLE_IDS } from "@idp/schema/entity/role";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it, test, vi } from "vitest";
import { JWT_ALG } from "../constants/jwt";
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

type ProfilePayloadTestcases = [string, Record<string, unknown>][];
const INVALID_PAYLOADS_FOR_REGISTER = [] satisfies ProfilePayloadTestcases;
const INVALID_PAYLOADS_FOR_UPDATE = [
	["too long bio", { bio: "a".repeat(301) }],
	[
		"too many socialLinks",
		{ socialLinks: new Array(6).fill("https://example.com") },
	],
] satisfies ProfilePayloadTestcases;
const INVALID_PAYLOADS_FOR_BOTH = [
	["absent displayName", { displayName: undefined }],
	["empty displayName", { displayName: "" }],
	["absent realName", { realName: undefined }],
	["empty realName", { realName: "" }],
	["realName w/o spaces", { realName: "テストユーザー" }],
	["absent realNameKana", { realNameKana: undefined }],
	["empty realNameKana", { realNameKana: "" }],
	["realNameKana w/o spaces", { realNameKana: "てすとゆーざー" }],
	["absent displayId", { displayId: undefined }],
	["empty displayId", { displayId: "" }],
	["too short displayId", { displayId: "a" }],
	["too long displayId", { displayId: "a".repeat(17) }],
	["only underscores in displayId", { displayId: "_____" }],
	["uppercase displayId", { displayId: "ABC" }],
	["invalid characters in displayId", { displayId: "test-user!" }],
	["absent email", { email: undefined }],
	["empty email", { email: "" }],
	["invalid email", { email: "invalid-email" }],
	["absent academicEmail (non-guest)", { academicEmail: undefined }],
	["empty academicEmail", { academicEmail: "" }],
	["academicEmail in email field", { email: "invalid@ms.saitama-u.ac.jp" }],
	["normal email in academicEmail field", { academicEmail: "foo@bar.test" }],
	["absent studentId (non-guest)", { studentId: undefined }],
	["empty studentId", { studentId: "" }],
	["invalid studentId (1)", { studentId: "1234567" }],
	["invalid studentId (2)", { studentId: "1A34567" }],
] satisfies ProfilePayloadTestcases;

const VALID_PAYLOADS_FOR_REGISTER = [] satisfies ProfilePayloadTestcases;
const VALID_PAYLOADS_FOR_UPDATE = [
	["no socialLinks", { socialLinks: [] }],
] satisfies ProfilePayloadTestcases;
const VALID_PAYLOADS_FOR_BOTH = [
	[
		"no academicEmail and studentId for Guest",
		{ grade: "ゲスト", academicEmail: undefined, studentId: undefined },
	],
	[
		"no academicEmail and studentId for Graduate",
		{ grade: "卒業生", academicEmail: undefined, studentId: undefined },
	],
] satisfies ProfilePayloadTestcases;

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

		it.each([
			...INVALID_PAYLOADS_FOR_BOTH,
			...INVALID_PAYLOADS_FOR_REGISTER,
		])("should return 400 for invalid input: %s", async (_description, invalidPayload) => {
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

		it.each([
			...VALID_PAYLOADS_FOR_BOTH,
			...VALID_PAYLOADS_FOR_REGISTER,
		])("should return 201 for valid input: %s", async (_description, validPayload) => {
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

		it.each([
			...INVALID_PAYLOADS_FOR_BOTH,
			...INVALID_PAYLOADS_FOR_UPDATE,
		])("should return 400 for invalid input: %s", async (_description, invalidPayload) => {
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

		it.each([
			...VALID_PAYLOADS_FOR_BOTH,
			...VALID_PAYLOADS_FOR_UPDATE,
		])("should return 204 for valid input: %s", async (_description, validPayload) => {
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
