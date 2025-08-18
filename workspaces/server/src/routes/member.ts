import { OAUTH_PROVIDER_IDS } from "../constants/oauth";
import { factory } from "../factory";
import { memberOnlyMiddleware } from "../middleware/auth";

const app = factory.createApp();

const route = app
	.get("/list", memberOnlyMiddleware, async (c) => {
		const { UserRepository } = c.var;
		const members = await UserRepository.fetchMembers();
		return c.json(members);
	})
	.get("/profile/:userDisplayId", memberOnlyMiddleware, async (c) => {
		const userDisplayId = c.req.param("userDisplayId");
		const { UserRepository } = c.var;

		const member = await UserRepository.fetchMemberByDisplayId(
			userDisplayId,
		).catch(() => null);

		if (!member) {
			return c.body(null, 404);
		}
		return c.json(member);
	})
	.get("/contribution/:userDisplayId", memberOnlyMiddleware, async (c) => {
		const userDisplayId = c.req.param("userDisplayId");
		const {
			ContributionRepository,
			ContributionCacheRepository,
			OAuthInternalRepository,
		} = c.var;

		const oauthConnections =
			await OAuthInternalRepository.fetchOAuthConnectionsByUserDisplayId(
				userDisplayId,
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
			return c.json(cached);
		}

		const contributions = await ContributionRepository.getContributions(
			githubConn.name,
		);

		// パフォーマンスのため post cache する
		// ref: https://zenn.dev/monica/articles/a9fdc5eea7f59c
		c.executionCtx.waitUntil(
			ContributionCacheRepository.set(githubConn.name, contributions),
		);

		return c.json(contributions);
	});

export { route as memberRoute };
