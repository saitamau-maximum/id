import { ArrowUpRight } from "react-feather";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { MessageBox } from "~/components/ui/message-box";
import type { DiscordInfo } from "~/types/discord-info";
import { useDiscordInvite } from "../hooks/use-discord-invite";

interface DiscordInvitationMessageBoxProps {
	discordInfo?: DiscordInfo;
}

export const DiscordInvitationMessageBox = ({
	discordInfo,
}: DiscordInvitationMessageBoxProps) => {
	const { mutate: inviteDiscord } = useDiscordInvite();
	const navigate = useNavigate();

	if (!discordInfo || discordInfo.status === "joined") {
		// Loading は表示しない
		// すでにサーバーに参加している場合にも何も表示する必要はない
		return null;
	}

	if (discordInfo.status === "not_linked") {
		return (
			<MessageBox
				variant="info"
				right={<ArrowUpRight size={24} />}
				onClick={() => {
					navigate("/settings");
				}}
			>
				<img
					src="/discord.svg"
					alt="Discord"
					width={16}
					height={16}
					className={css({
						display: "inline-block",
						marginRight: 2,
					})}
				/>
				Discord アカウントを連携させよう！
				<br />
				<span className={css({ fontSize: "xs" })}>
					Discord アカウントを連携すると、 Maximum の Discord
					に参加できるようになります。
				</span>
			</MessageBox>
		);
	}

	// status === not_joined
	return (
		<MessageBox
			variant="info"
			right={<ArrowUpRight size={24} />}
			onClick={() => {
				inviteDiscord();
			}}
		>
			<img
				src="/discord.svg"
				alt="Discord"
				width={16}
				height={16}
				className={css({
					display: "inline-block",
					marginRight: 2,
				})}
			/>
			Maximum の Discord に参加しよう！
			<br />
			<span className={css({ fontSize: "xs" })}>
				このバナーをクリックすると、連携されている Discord アカウントが Maximum
				の Discord サーバーに追加されます。
			</span>
		</MessageBox>
	);
};
