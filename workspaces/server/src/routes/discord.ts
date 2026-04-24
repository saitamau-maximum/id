import type {
	DiscordInfoJoinedResponse,
	DiscordInfoNotJoinedResponse,
	DiscordInfoNotLinkedResponse,
	PostInviteDiscordResponse,
} from "@idp/schema/api/discord";
import { OAUTH_PROVIDER_IDS } from "@idp/schema/entity/oauth-internal/oauth-provider";
import {
	OAuth2Routes,
	OAuth2Scopes,
	PermissionFlagsBits,
} from "discord-api-types/v10";
import { factory } from "../factory";
import { cookieAuthMiddleware, memberOnlyMiddleware } from "../middleware/auth";

const app = factory.createApp();

const route = app
	.get("/add-bot", cookieAuthMiddleware, async (c) => {
		const botPermissions = [
			PermissionFlagsBits.ManageRoles,
			PermissionFlagsBits.CreateInstantInvite,
			PermissionFlagsBits.SendMessages,
		];

		const redirectTo = new URL(OAuth2Routes.authorizationURL);
		redirectTo.searchParams.set("client_id", c.env.DISCORD_OAUTH_ID);
		redirectTo.searchParams.set("scope", [OAuth2Scopes.Bot].join(" "));
		redirectTo.searchParams.set(
			"permissions",
			botPermissions.reduce((a, b) => a | b, 0n).toString(),
		);

		// guild_id を指定して disable_guild_select を true にすることで、
		// (完全ではないが) ユーザーが他の guild にインストールすることを防ぐ
		redirectTo.searchParams.set("guild_id", c.env.DISCORD_GUILD_ID);
		redirectTo.searchParams.set("disable_guild_select", "true");

		return c.redirect(redirectTo.toString());
	})
	.get("/:userDisplayId", memberOnlyMiddleware, async (c) => {
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
			return c.json<DiscordInfoNotLinkedResponse>({ status: "not_linked" });
		}
		const member = await DiscordBotRepository.getGuildMember(
			discordConn.providerUserId,
		);
		// Discord Docs には member.user は存在すると書かれているが
		// なぜか存在しないことがあるので念のためチェックする
		if (!member || !member.user) {
			return c.json<DiscordInfoNotJoinedResponse>({ status: "not_joined" });
		}
		// 載せたくない情報も含まれているので制限する
		return c.json<DiscordInfoJoinedResponse>({
			status: "joined",
			displayName:
				member.nick || member.user.global_name || member.user.username,
		});
	})
	.post("/invite", memberOnlyMiddleware, async (c) => {
		const { userId } = c.get("jwtPayload");

		const { DiscordBotRepository, OAuthInternalRepository } = c.var;

		const discordAccessToken =
			await OAuthInternalRepository.fetchAccessTokenByUserId(
				userId,
				OAUTH_PROVIDER_IDS.DISCORD,
			);

		if (!discordAccessToken) {
			return c.text<PostInviteDiscordResponse>("failed");
		}

		const res = await DiscordBotRepository.addGuildMember(discordAccessToken);

		return c.text(res);
	});

export { route as discordRoute };
