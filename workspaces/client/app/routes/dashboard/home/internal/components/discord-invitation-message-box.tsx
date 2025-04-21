import { ArrowUpRight } from "react-feather";
import { css } from "styled-system/css";
import { MessageBox } from "~/components/ui/message-box";
import { useToast } from "~/hooks/use-toast";
import { useDiscordInvitationURL } from "../hooks/use-discord-invitation-url";

export const DiscordInvitationMessageBox = () => {
	const { data: discordInvitationUrl } = useDiscordInvitationURL();
	const { pushToast } = useToast();

	return (
		<MessageBox
			variant="info"
			right={<ArrowUpRight size={24} />}
			onClick={() => {
				if (!discordInvitationUrl) {
					pushToast({
						type: "error",
						title: "Discord の招待 URL が取得できませんでした。",
						description: "画面を再読み込みしてみてください。",
					});
					return;
				}
				window.open(discordInvitationUrl);
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
				※ すでに参加している人にも表示されています。
				そのうち参加者には非表示になる予定です。
			</span>
		</MessageBox>
	);
};
