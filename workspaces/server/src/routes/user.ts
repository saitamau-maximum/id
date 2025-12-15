import { vValidator } from "@hono/valibot-validator";
import { stream } from "hono/streaming";
import * as v from "valibot";
import { optimizeImage } from "wasm-image-optimization";
import { OAUTH_PROVIDER_IDS } from "../constants/oauth";
import { ACADEMIC_EMAIL_DOMAIN } from "../constants/validation";
import { BIO_MAX_LENGTH, RESERVED_WORDS } from "../constants/validation";
import { factory } from "../factory";
import { authMiddleware, memberOnlyMiddleware } from "../middleware/auth";

const app = factory.createApp();

// 本名を"姓 名"の形式に正規化する
const normalizeRealName = (text: string) => {
	return text.trim().replace(/\s+/g, " ");
};

// 本名を表す文字列において、苗字、名前、ミドルネーム等が1つ以上の空文字で区切られている場合に受理される
const realNamePattern = /^(?=.*\S(?:[\s　]+)\S).+$/;

const ProfileSchema = v.object({
	displayName: v.pipe(v.string(), v.nonEmpty()),
	realName: v.pipe(
		v.string(),
		v.regex(realNamePattern),
		v.nonEmpty(),
		v.maxLength(16),
	),
	realNameKana: v.pipe(
		v.string(),
		v.regex(realNamePattern),
		v.nonEmpty(),
		v.maxLength(16),
	),
	displayId: v.pipe(
		v.string(),
		v.nonEmpty(),
		v.check((value) => !value.match(/^_+$/)),
		v.check((value) => !RESERVED_WORDS.includes(value)),
		v.regex(/^[a-z0-9_]{3,16}$/),
	),
	email: v.pipe(
		v.string(),
		v.nonEmpty(),
		v.email(),
		v.check((value) => {
			const domain = value.split("@")[1];
			return domain !== ACADEMIC_EMAIL_DOMAIN;
		}),
	),
	academicEmail: v.optional(
		v.pipe(
			v.string(),
			v.nonEmpty(),
			v.email(),
			v.check((value) => {
				const domain = value.split("@")[1];
				return domain === ACADEMIC_EMAIL_DOMAIN;
			}),
		),
	),
	studentId: v.optional(
		v.pipe(v.string(), v.nonEmpty(), v.regex(/^\d{2}[A-Z]{2}\d{3}$/)),
	),
	grade: v.pipe(v.string(), v.nonEmpty()),
	faculty: v.optional(v.pipe(v.string(), v.nonEmpty())),
	laboratory: v.optional(v.pipe(v.string(), v.nonEmpty())),
	bio: v.pipe(v.string(), v.maxLength(BIO_MAX_LENGTH)),
	socialLinks: v.pipe(v.array(v.pipe(v.string(), v.url())), v.maxLength(5)),
});

const registerSchema = v.pipe(
	v.object({
		displayName: ProfileSchema.entries.displayName,
		realName: ProfileSchema.entries.realName,
		realNameKana: ProfileSchema.entries.realNameKana,
		displayId: ProfileSchema.entries.displayId,
		email: ProfileSchema.entries.email,
		academicEmail: ProfileSchema.entries.academicEmail,
		studentId: ProfileSchema.entries.studentId,
		grade: ProfileSchema.entries.grade,
		faculty: ProfileSchema.entries.faculty,
		department: v.optional(v.pipe(v.string(), v.nonEmpty())),
		laboratory: ProfileSchema.entries.laboratory,
	}),
	v.check(({ grade, academicEmail, studentId }) => {
		// もしgradeが卒業生かゲストでないなら、academicEmailとstudentIdは必須
		if (grade !== "卒業生" && grade !== "ゲスト") {
			if (!academicEmail || !studentId) {
				return false;
			}
		}
		return true;
	}, "academicEmail and studentId are required"),
);

const updateSchema = v.pipe(
	v.object({
		displayName: ProfileSchema.entries.displayName,
		realName: ProfileSchema.entries.realName,
		realNameKana: ProfileSchema.entries.realNameKana,
		displayId: ProfileSchema.entries.displayId,
		email: ProfileSchema.entries.email,
		academicEmail: ProfileSchema.entries.academicEmail,
		studentId: ProfileSchema.entries.studentId,
		grade: ProfileSchema.entries.grade,
		faculty: ProfileSchema.entries.faculty,
		department: v.optional(v.pipe(v.string(), v.nonEmpty())),
		laboratory: ProfileSchema.entries.laboratory,
		bio: ProfileSchema.entries.bio,
		socialLinks: ProfileSchema.entries.socialLinks,
	}),
	v.check(({ grade, academicEmail, studentId }) => {
		// もしgradeが卒業生かゲストでないなら、academicEmailとstudentIdは必須
		if (grade !== "卒業生" && grade !== "ゲスト") {
			if (!academicEmail || !studentId) {
				return false;
			}
		}
		return true;
	}, "academicEmail and studentId are required"),
);

const updateProfileImageSchema = v.object({
	image: v.pipe(v.file(), v.maxSize(1024 * 1024 * 5)), // 5MiB
});

const route = app
	.post(
		"/register",
		authMiddleware,
		vValidator("json", registerSchema),
		async (c) => {
			const payload = c.get("jwtPayload");
			const { UserRepository } = c.var;

			const {
				displayName,
				realName,
				realNameKana,
				displayId,
				academicEmail,
				email,
				studentId,
				grade,
				faculty,
				laboratory,
			} = c.req.valid("json");

			const normalizedDisplayName = normalizeRealName(displayName);
			const normalizedRealName = normalizeRealName(realName);
			const normalizedRealNameKana = normalizeRealName(realNameKana);

			await UserRepository.registerUser(payload.userId, {
				displayName: normalizedDisplayName,
				displayId,
				realName: normalizedRealName,
				realNameKana: normalizedRealNameKana,
				academicEmail,
				email,
				studentId,
				grade,
				faculty,
				laboratory,
			});

			return c.body(null, 201);
		},
	)
	.put(
		"/update",
		memberOnlyMiddleware,
		vValidator("json", updateSchema),
		async (c) => {
			const payload = c.get("jwtPayload");
			const { UserRepository } = c.var;

			const {
				displayName,
				realName,
				realNameKana,
				displayId,
				academicEmail,
				email,
				studentId,
				grade,
				faculty,
				laboratory,
				bio,
				socialLinks,
			} = c.req.valid("json");

			const normalizedDisplayName = normalizeRealName(displayName);
			const normalizedRealName = normalizeRealName(realName);
			const normalizedRealNameKana = normalizeRealName(realNameKana);

			await UserRepository.updateUser(payload.userId, {
				displayName: normalizedDisplayName,
				displayId,
				realName: normalizedRealName,
				realNameKana: normalizedRealNameKana,
				academicEmail,
				email,
				studentId,
				grade,
				faculty,
				laboratory,
				bio,
				socialLinks,
			});

			return c.body(null, 204);
		},
	)
	.get("/contributions", memberOnlyMiddleware, async (c) => {
		const payload = c.get("jwtPayload");
		const {
			ContributionRepository,
			ContributionCacheRepository,
			OAuthInternalRepository,
		} = c.var;

		const oauthConnections =
			await OAuthInternalRepository.fetchOAuthConnectionsByUserId(
				payload.userId,
			).catch(() => []);

		const githubConn = oauthConnections.find(
			(conn) => conn.providerId === OAUTH_PROVIDER_IDS.GITHUB,
		);

		if (!githubConn || !githubConn.name) {
			return c.body(null, 404);
		}

		const cached = await ContributionCacheRepository.get(
			githubConn.name, // GitHub の login (= @username) が入っている
		);

		if (cached) {
			return c.json(cached, 200);
		}

		const contributions = await ContributionRepository.getContributions(
			githubConn.name,
		);

		// パフォーマンスのため post cache する
		// ref: https://zenn.dev/monica/articles/a9fdc5eea7f59c
		c.executionCtx.waitUntil(
			ContributionCacheRepository.set(githubConn.name, contributions),
		);

		return c.json(contributions, 200);
	})
	.put(
		"/profile-image",
		memberOnlyMiddleware,
		vValidator("form", updateProfileImageSchema),
		async (c) => {
			const payload = c.get("jwtPayload");
			const serverOrigin = new URL(c.req.url).origin;
			const { UserStorageRepository, UserRepository } = c.var;

			const { image } = c.req.valid("form");

			const optimizedImageArrayBuffer = await optimizeImage({
				image: await image.arrayBuffer(),
				width: 256,
				height: 256,
				format: "webp",
			});
			if (!optimizedImageArrayBuffer) {
				throw new Error("Failed to optimize image");
			}

			const optimizedImageUint8Array = new Uint8Array(
				optimizedImageArrayBuffer,
			);

			await UserStorageRepository.uploadProfileImage(
				new Blob([optimizedImageUint8Array], { type: "image/webp" }),
				payload.userId,
			);

			await UserRepository.updateUser(payload.userId, {
				profileImageURL: `${serverOrigin}/user/profile-image/${payload.userId}?${Date.now()}`,
			});

			return c.body(null, 204);
		},
	)
	.delete("/oauth-connection/:providerId", memberOnlyMiddleware, async (c) => {
		const { userId } = c.get("jwtPayload");
		const { OAuthInternalRepository } = c.var;
		const providerIdStr = c.req.param("providerId");

		if (
			!Object.values(OAUTH_PROVIDER_IDS).map(String).includes(providerIdStr)
		) {
			return c.text("Invalid providerId", 400);
		}

		const providerId = Number.parseInt(providerIdStr, 10);
		// Assert
		if (
			Number.isNaN(providerId) ||
			!Object.values(OAUTH_PROVIDER_IDS).includes(providerId)
		) {
			return c.text("Invalid providerId", 400);
		}

		await OAuthInternalRepository.deleteOAuthConnection(userId, providerId);
		return c.body(null, 204);
	})
	.get("/profile-image/:userId", async (c) => {
		// TODO 画像のキャッシュを考慮する
		const { UserStorageRepository } = c.var;
		const userId = c.req.param("userId");

		try {
			const body = await UserStorageRepository.getProfileImageURL(userId);
			c.header("Content-Type", "image/webp");
			return stream(c, (s) => s.pipe(body));
		} catch {
			return c.text("Not found", 404);
		}
	});

export { route as userRoute };
