import { vValidator } from "@hono/valibot-validator";
import { stream } from "hono/streaming";
import * as v from "valibot";
import { optimizeImage } from "wasm-image-optimization";
import { OAUTH_PROVIDER_IDS } from "../constants/oauth";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";

const app = factory.createApp();

const registerSchema = v.object({
	displayName: v.pipe(v.string(), v.nonEmpty()),
	realName: v.pipe(v.string(), v.nonEmpty()),
	realNameKana: v.pipe(v.string(), v.nonEmpty()),
	displayId: v.pipe(v.string(), v.nonEmpty(), v.regex(/^[a-z0-9_]{3,16}$/)),
	email: v.pipe(v.string(), v.nonEmpty(), v.email()),
	academicEmail: v.pipe(v.string(), v.nonEmpty(), v.email()),
	studentId: v.pipe(v.string(), v.nonEmpty(), v.regex(/^\d{2}[A-Z]{2}\d{3}$/)),
	grade: v.pipe(v.string(), v.nonEmpty()),
});

const updateProfileImageSchema = v.object({
	image: v.pipe(v.file(), v.maxSize(1024 * 1024 * 5)), // 5MB
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
			} = c.req.valid("json");

			await UserRepository.registerUser(payload.userId, {
				displayName,
				displayId,
				realName,
				realNameKana,
				academicEmail,
				email,
				studentId,
				grade,
			});

			return c.text("ok", 200);
		},
	)
	.put(
		"/update",
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
			} = c.req.valid("json");

			await UserRepository.updateUser(payload.userId, {
				displayName,
				displayId,
				realName,
				realNameKana,
				academicEmail,
				email,
				studentId,
				grade,
			});

			return c.text("ok", 200);
		},
	)
	.get("/contributions", authMiddleware, async (c) => {
		const payload = c.get("jwtPayload");
		const {
			ContributionRepository,
			ContributionCacheRepository,
			OAuthRepository,
		} = c.var;

		const oauthConnections =
			await OAuthRepository.fetchOAuthConnectionsByUserId(payload.userId);

		const githubConn = oauthConnections.find(
			(conn) => conn.providerId === OAUTH_PROVIDER_IDS.GITHUB,
		);

		if (!githubConn || !githubConn.name) {
			return c.text("User not found", 404);
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
		authMiddleware,
		vValidator("form", updateProfileImageSchema),
		async (c) => {
			const payload = c.get("jwtPayload");
			const serverOrigin = new URL(c.req.url).origin;
			const { UserStorageRepository, UserRepository } = c.var;

			const { image } = c.req.valid("form");

			try {
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

				return c.text("ok", 200);
			} catch (e) {
				console.error(e);
				return c.text("Failed to upload profile image", 500);
			}
		},
	)
	.get("/profile-image/:userId", async (c) => {
		// TODO 画像のキャッシュを考慮する
		const { UserStorageRepository } = c.var;
		const userId = c.req.param("userId");

		try {
			const body = await UserStorageRepository.getProfileImageURL(userId);
			c.header("Content-Type", "image/webp");
			return stream(c, (s) => s.pipe(body));
		} catch (e) {
			console.error(e);
			return c.text("Not found", 404);
		}
	});

export { route as userRoute };
