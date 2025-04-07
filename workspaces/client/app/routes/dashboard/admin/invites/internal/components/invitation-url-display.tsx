import { useCallback, useState } from "react";
import { Check, Copy } from "react-feather";
import { css } from "styled-system/css";
import { IconButton } from "~/components/ui/icon-button";
import { useToast } from "~/hooks/use-toast";

interface Props {
	title: string;
	id: string;
}

export const InvitationURLDisplay = ({ title, id }: Props) => {
	const [copied, setCopied] = useState(false);
	const { pushToast } = useToast();

	const invitationURL = `${window.location.origin}/invitation/${id}`;

	const handleCopyClientId = useCallback(() => {
		navigator.clipboard.writeText(invitationURL);
		setCopied(true);
		pushToast({
			type: "success",
			title: "招待リンクをコピーしました",
		});
		setTimeout(() => setCopied(false), 3000);
	}, [invitationURL, pushToast]);

	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				margin: "token(spacing.8) 0",
			})}
		>
			<span
				className={css({
					fontSize: "lg",
					fontWeight: "bold",
					color: "gray.600",
					marginBottom: 4,
				})}
			>
				{title}
			</span>
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
					})}
				>
					{invitationURL}
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
		</div>
	);
};
