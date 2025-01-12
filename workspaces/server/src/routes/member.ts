import { OAUTH_PROVIDER_IDS } from "../constants/oauth";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";

const app = factory.createApp();

const route = app
	.use(authMiddleware)
	.get("/list", async (c) => {
		const { UserRepository } = c.var;
		try {
			const members = await UserRepository.fetchMembers();
			return c.json(members);
		} catch (e) {
			return c.json({ error: "member not found" }, 404);
		}
	})
	.get("/profile/:userDisplayId", async (c) => {
		const userDisplayId = c.req.param("userDisplayId");
		const { UserRepository } = c.var;
		try {
			const member = await UserRepository.fetchMemberByDisplayId(userDisplayId);
			return c.json(member);
		} catch (e) {
			return c.json({ error: "member not found" }, 404);
		}
	})
	.get("/contribution/:userDisplayId", async (c) => {
		const userDisplayId = c.req.param("userDisplayId");
		const {
			ContributionRepository,
			ContributionCacheRepository,
			OAuthRepository,
		} = c.var;

		const oauthConnections =
			await OAuthRepository.fetchOAuthConnectionsByUserDisplayId(userDisplayId);

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
	});

export { route as memberRoute };
