import { useCallback, useState } from "react";
import { ArrowUpRight, Check, Copy } from "react-feather";
import { css } from "styled-system/css";
import { AnchorLike } from "~/components/ui/anchor-like";
import { IconButton } from "~/components/ui/icon-button";
import { useToast } from "~/hooks/use-toast";

interface Props {
	url: string;
}

export const ICalDisplay = ({ url }: Props) => {
	const [copied, setCopied] = useState(false);
	const { pushToast } = useToast();

	const handleCopyClientId = useCallback(() => {
		navigator.clipboard.writeText(url);
		setCopied(true);
		pushToast({
			type: "success",
			title: "URLをコピーしました",
		});
		setTimeout(() => setCopied(false), 3000);
	}, [url, pushToast]);

	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				margin: "token(spacing.8) 0",
				gap: "token(spacing.4)",
			})}
		>
			<div
				className={css({
					display: "grid",
					gridTemplateColumns: "1fr auto",
					gap: 2,
					placeItems: "center",
					justifyContent: "center",
				})}
			>
				<code
					className={css({
						backgroundColor: "gray.100",
						borderRadius: "md",
						padding: 2,
						wordBreak: "break-all",
						whiteSpace: "nowrap",
						overflow: "hidden",
						width: "100%",
						textOverflow: "ellipsis",
					})}
				>
					{url}
				</code>
				<IconButton
					type="button"
					onClick={handleCopyClientId}
					label="Copy Client ID"
				>
					{copied ? (
						<Check size={16} className={css({ color: "green.600" })} />
					) : (
						<Copy size={16} />
					)}
				</IconButton>
			</div>
			<p className={css({ textAlign: "center", color: "gray.600" })}>
				"iCal"を使ってGoogle CalendarやApple Calendarなどと同期できます
				<br />
				登録方法は
				<a
					href="https://github.com/saitamau-maximum/id/wiki/add-ical"
					target="_blank"
					rel="noreferrer"
				>
					<AnchorLike>
						こちら
						<ArrowUpRight size={16} />
					</AnchorLike>
				</a>
				をご覧ください
			</p>
		</div>
	);
};
