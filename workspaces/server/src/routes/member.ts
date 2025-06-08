import { OAUTH_PROVIDER_IDS } from "../constants/oauth";
import { factory } from "../factory";
import { memberOnlyMiddleware } from "../middleware/auth";

const app = factory.createApp();

type DiscordInfoResNotLinked = {
	status: "not_linked";
};
type DiscordInfoResNotJoined = {
	status: "not_joined";
};
type DiscordInfoResJoined = {
	status: "joined";
	displayName: string;
};

const route = app
	.get("/list", memberOnlyMiddleware, async (c) => {
		const { UserRepository } = c.var;
		try {
			const members = await UserRepository.fetchMembers();
			return c.json(members);
		} catch (e) {
			return c.json({ error: "member not found" }, 404);
		}
	})
	.get("/profile/:userDisplayId", memberOnlyMiddleware, async (c) => {
		const userDisplayId = c.req.param("userDisplayId");
		const { UserRepository } = c.var;
		try {
			const member = await UserRepository.fetchMemberByDisplayId(userDisplayId);
			return c.json(member);
		} catch (e) {
			return c.json({ error: "member not found" }, 404);
		}
	})
	.get("/discord/:userDisplayId", memberOnlyMiddleware, async (c) => {
		const userDisplayId = c.req.param("userDisplayId");
		const { DiscordBotRepository, OAuthInternalRepository } = c.var;

		const conn =
			await OAuthInternalRepository.fetchOAuthConnectionsByUserDisplayId(
				userDisplayId,
			);
		const discordConn = conn.find(
			(c) => c.providerId === OAUTH_PROVIDER_IDS.DISCORD,
		);
		if (!discordConn) {
			return c.json({ status: "not_linked" } as DiscordInfoResNotLinked);
		}
		const member = await DiscordBotRepository.getGuildMember(
			discordConn.providerUserId,
		);
		if (!member) {
			return c.json({ status: "not_joined" } as DiscordInfoResNotJoined);
		}
		// 載せたくない情報も含まれているので制限する
		return c.json({
			status: "joined",
			// global_name: Discord サーバー内での表示名 (may be undefined)
			// username: Discord 全体 (defined)
			displayName: member.user.global_name || member.user.username,
		} as DiscordInfoResJoined);
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
			);

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
