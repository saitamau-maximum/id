import { vValidator } from "@hono/valibot-validator";
import {
	UserProfileUpdateParams,
	UserRegisterParams,
} from "@idp/schema/api/user";
import { stream } from "hono/streaming";
import * as v from "valibot";
import { optimizeImage } from "wasm-image-optimization";
import {
	isValidOAuthProviderId,
	OAUTH_PROVIDER_IDS,
	REQUIRED_OAUTH_PROVIDER_IDS,
} from "../constants/oauth";
import { factory } from "../factory";
import { authMiddleware, memberOnlyMiddleware } from "../middleware/auth";

const app = factory.createApp();

// 本名を"姓 名"の形式に正規化する
const normalizeRealName = (text: string) => {
	return text.trim().replace(/\s+/g, " ");
};

const updateProfileImageSchema = v.object({
	image: v.pipe(v.file(), v.maxSize(1024 * 1024 * 5)), // 5MiB
});

const route = app
	.post(
		"/register",
		authMiddleware,
		vValidator("json", UserRegisterParams),
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
				department,
				laboratory,
				graduateSchool,
				specialization,
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
				department,
				laboratory,
				graduateSchool,
				specialization,
			});

			return c.body(null, 201);
		},
	)
	.put(
		"/update",
		memberOnlyMiddleware,
		vValidator("json", UserProfileUpdateParams),
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
				department,
				laboratory,
				graduateSchool,
				specialization,
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
				department,
				laboratory,
				graduateSchool,
				specialization,
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

		const providerId = Number.parseInt(providerIdStr, 10);
		if (
			!/^\d+$/.test(providerIdStr) ||
			Number.isNaN(providerId) ||
			!isValidOAuthProviderId(providerId)
		) {
			return c.text("Invalid providerId", 400);
		}

		if (REQUIRED_OAUTH_PROVIDER_IDS.includes(providerId)) {
			return c.text("Cannot delete required OAuth connection", 400);
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
