import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { OAUTH_PROVIDER_IDS } from "../constants/oauth";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";

const app = factory.createApp();

const registerSchema = v.object({
	displayName: v.pipe(v.string(), v.nonEmpty()),
	realName: v.pipe(v.string(), v.nonEmpty()),
	realNameKana: v.pipe(v.string(), v.nonEmpty()),
	displayId: v.pipe(v.string(), v.nonEmpty()),
	email: v.pipe(v.string(), v.nonEmpty(), v.email()),
	studentId: v.pipe(v.string(), v.nonEmpty()),
	grade: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	.use(authMiddleware)
	.post("/register", vValidator("json", registerSchema), async (c) => {
		const payload = c.get("jwtPayload");
		const { UserRepository } = c.var;

		const {
			displayName,
			realName,
			realNameKana,
			displayId,
			email,
			studentId,
			grade,
		} = c.req.valid("json");

		await UserRepository.updateUser(payload.userId, {
			displayName,
			displayId,
			realName,
			realNameKana,
			email,
			studentId,
			grade,
		});

		return c.text("ok", 200);
	})
	.get("/contributions", async (c) => {
		const payload = c.get("jwtPayload");
		const {
			ContributionRepository,
			ContributionCacheRepository,
			UserRepository,
		} = c.var;

		const user = await UserRepository.fetchUserWithOAuthConnectionById(
			payload.userId,
		);

		const githubConn = user.oauthConnections.find(
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
	});

export { route as userRoute };
