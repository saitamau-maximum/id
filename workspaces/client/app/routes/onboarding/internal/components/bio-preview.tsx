import { css } from "styled-system/css";
import { useMarkdown } from "~/hooks/use-markdown";

type BioPreviewProps = {
	bio: string | undefined;
};

export const BioPreview = ({ bio }: BioPreviewProps) => {
	const { reactContent: BioPreviewContent } = useMarkdown(bio);

	return (
		<div
			className={css({
				color: "gray.500",
				fontSize: "md",
				mdDown: {
					fontSize: "sm",
				},
				overflowWrap: "break-word",
				lineHeight: "1.5",
				whiteSpace: "pre-wrap",
				padding: "token(spacing.2) token(spacing.4)",
				borderRadius: 6,
				borderWidth: 1,
				borderStyle: "solid",
				borderColor: "gray.300",
				outline: "none",
				width: "100%",
			})}
		>
			<div
				className={css({
					height: "240px",
				})}
			>
				{BioPreviewContent ? BioPreviewContent : ""}
			</div>
		</div>
	);
};
