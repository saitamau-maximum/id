import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";

const app = factory.createApp();

const registerSchema = v.object({
	displayName: v.pipe(v.string(), v.nonEmpty()),
	email: v.pipe(v.string(), v.nonEmpty(), v.email()),
	studentId: v.pipe(v.string(), v.nonEmpty()),
	grade: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	.use(authMiddleware)
	.post("/register", vValidator("json", registerSchema), async (c) => {
		const payload = c.get("jwtPayload");
		const { UserRepository } = c.var;

		const { displayName, email, studentId, grade } = c.req.valid("json");

		await UserRepository.updateUser(payload.userId, {
			displayName,
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

		const githubUser = await UserRepository.fetchUserById(payload.userId);

		if (!githubUser.providerUserId) {
			return c.text("User not found", 404);
		}

		const cached = await ContributionCacheRepository.get(
			githubUser.providerUserId,
		);

		if (cached) {
			return c.json(cached, 200);
		}

		const contributions = await ContributionRepository.getContributions(
			githubUser.providerUserId,
		);

		// パフォーマンスのため post cache する
		// ref: https://zenn.dev/monica/articles/a9fdc5eea7f59c
		c.executionCtx.waitUntil(
			ContributionCacheRepository.set(githubUser.providerUserId, contributions),
		);

		return c.json(contributions, 200);
	});

export { route as userRoute };
