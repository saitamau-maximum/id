import { useEffect, useState } from "react";
import { ArrowUpRight } from "react-feather";
import { css } from "styled-system/css";
import { MessageBox } from "~/components/ui/message-box";
import { useRepository } from "~/hooks/use-repository";

export const DiscordInvitationMessageBox = () => {
	const { miscRepository } = useRepository();
	const [discordInvitationUrl, setDiscordInvitationUrl] = useState("");

	useEffect(() => {
		miscRepository.getDiscordInvitationURL().then(setDiscordInvitationUrl);
	}, [miscRepository]);

	return (
		<MessageBox
			variant="info"
			right={<ArrowUpRight size={24} />}
			onClick={() => {
				if (!discordInvitationUrl) {
					alert("Discord の招待 URL が取得できませんでした。");
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
