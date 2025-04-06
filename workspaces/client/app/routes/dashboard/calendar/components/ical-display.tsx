import { useCallback, useState } from "react";
import { Check, Copy } from "react-feather";
import { css } from "styled-system/css";
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
			<p>"iCal"を使ってGoogle CalendarやApple Calendarなどと同期できます</p>
		</div>
	);
};
