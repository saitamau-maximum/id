import { OAUTH_PROVIDER_IDS } from "@idp/schema/entity/oauth-internal/oauth-provider";
import type { Webhooks } from "@octokit/webhooks";
import type { Context } from "hono";
import type { HonoEnv } from "../../factory";

export const notifyDiscordOnComment = (
	c: Context<HonoEnv>,
	webhooks: Webhooks,
) => {
	const { OAuthInternalRepository, DiscordBotRepository } = c.var;

	const sendNotificationToDiscord = async ({
		message,
		prtitle,
		url,
		assignees,
		reviewers,
		mentioned,
		participants,
		sender,
	}: {
		message: string;
		prtitle: string;
		url: string;
		assignees: number[];
		reviewers: number[];
		mentioned: number[];
		participants: number[];
		sender: number;
	}) => {
		const relatedGithubUserIds = Array.from(
			new Set([
				...assignees,
				...reviewers,
				...mentioned,
				...participants,
				sender,
			]),
		);

		// GitHub userId -> Discord userId の map
		const githubDiscordIdsPair = await Promise.all(
			relatedGithubUserIds.map(async (githubUserId) => {
				const idpUserId =
					await OAuthInternalRepository.fetchUserIdByProviderInfo(
						githubUserId.toString(),
						OAUTH_PROVIDER_IDS.GITHUB,
					).catch(() => null); // 連携されていないユーザーは無視

				if (!idpUserId) return null;

				const oauthConns =
					await OAuthInternalRepository.fetchOAuthConnectionsByUserId(
						idpUserId,
					);

				const discordConn = oauthConns.find(
					(conn) => conn.providerId === OAUTH_PROVIDER_IDS.DISCORD,
				);

				if (!discordConn) return null;

				return {
					githubUserId,
					discordUserId: discordConn.providerUserId,
				};
			}),
		);
		const githubToDiscordIdMap: Record<number, string> = {};
		for (const pair of githubDiscordIdsPair) {
			if (!pair) continue;
			githubToDiscordIdMap[pair.githubUserId] = pair.discordUserId;
		}

		const convertToMentions = (githubUserIds: number[]) => {
			return githubUserIds
				.map((id) => {
					const discordUserId = githubToDiscordIdMap[id];
					return discordUserId ? `<@${discordUserId}>` : null;
				})
				.filter((val) => val !== null)
				.join(" ");
		};

		const mentions = convertToMentions(
			relatedGithubUserIds.filter((id) => id !== sender), // 自分自身へのメンションは不要なので除外
		);

		if (mentions === "") {
			// メンション対象がいない場合には送信しない
			return;
		}

		// GitHub URL から "repo #no" の形にする
		const pathname = new URL(url).pathname;
		// /saitamau-maximum/id/pull/123 -> "id #123"
		// /saitamau-maximum/id/issues/123 -> "id #123"
		const repo = pathname.split("/")[2];
		const num = pathname.split("/")[4];

		// 送信
		await DiscordBotRepository.sendMessage(
			c.env.DISCORD_GITHUB_NOTIFICATION_CHANNEL_ID,
			{
				content: `${mentions} ${message}`,
				embeds: [
					{
						title: `${repo} #${num}`,
						url,
						description: prtitle,
						timestamp: new Date().toISOString(),
						fields: [
							{
								name: "Sender",
								inline: true,
								value: convertToMentions([sender]) || "Unknown",
							},
							{
								name: "Assignees",
								inline: true,
								value: convertToMentions(assignees) || "",
							},
							{
								name: "Reviewers",
								inline: true,
								value: convertToMentions(reviewers) || "",
							},
							{
								name: "Participants",
								inline: true,
								value: convertToMentions(participants) || "",
							},
						].filter((field) => field.value !== ""), // value が空のフィールドは除外
					},
				],
			},
		);
	};

	const listUserIds = (users: ({ id: number } | null)[]) =>
		users.map((u) => u?.id).filter((id) => id !== undefined);

	webhooks.on(["pull_request.review_requested"], async ({ payload }) => {
		await sendNotificationToDiscord({
			message: "レビューリクエストが届きました",
			prtitle: payload.pull_request.title,
			url: payload.pull_request.html_url,
			assignees: listUserIds(payload.pull_request.assignees),
			reviewers: listUserIds(payload.pull_request.requested_reviewers),
			mentioned: [],
			participants: [], // TODO: webhook payload からは取れない
			sender: payload.sender.id,
		});
	});

	webhooks.on(["issue_comment.created"], async ({ payload }) => {
		const isPR = payload.issue.pull_request !== undefined;

		await sendNotificationToDiscord({
			message: "コメントが追加されました",
			prtitle: payload.issue.title,
			url: payload.comment.html_url,
			assignees: listUserIds(payload.issue.assignees),
			reviewers: isPR ? [] : [], // TODO: PR であっても webhook payload からは取れない
			mentioned: [], // TODO: displayId -> userId の変換が必要
			participants: [], // TODO: webhook payload からは取れない
			sender: payload.sender.id,
		});
	});

	webhooks.on(["pull_request_review.submitted"], async ({ payload }) => {
		await sendNotificationToDiscord({
			message:
				payload.review.state === "APPROVED"
					? ":approved:"
					: payload.review.state === "REQUEST_CHANGES"
						? ":changesrequest:"
						: "コメントが追加されました",
			prtitle: payload.pull_request.title,
			url: payload.review.html_url,
			assignees: listUserIds(payload.pull_request.assignees),
			reviewers: listUserIds(payload.pull_request.requested_reviewers),
			mentioned: [], // TODO: displayId -> userId の変換が必要
			participants: [], // TODO: webhook payload からは取れない
			sender: payload.sender.id,
		});
	});
};
