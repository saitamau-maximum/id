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

const route = app.get("/:userDisplayId", memberOnlyMiddleware, async (c) => {
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
		return c.json<DiscordInfoResNotLinked>({ status: "not_linked" });
	}
	const member = await DiscordBotRepository.getGuildMember(
		discordConn.providerUserId,
	);
	if (!member) {
		return c.json<DiscordInfoResNotJoined>({ status: "not_joined" });
	}
	// 載せたくない情報も含まれているので制限する
	return c.json<DiscordInfoResJoined>({
		status: "joined",
		// global_name: Discord サーバー内での表示名 (may be undefined)
		// username: Discord 全体 (defined)
		displayName: member.user.global_name || member.user.username,
	});
});

export { route as discordRoute };
