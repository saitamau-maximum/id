import { css } from "styled-system/css";
import { Document } from "~/components/ui/document";
import { useMarkdown } from "~/hooks/use-markdown";

type BioPreviewProps = {
	bio: string | undefined;
};

export const BioPreview = ({ bio }: BioPreviewProps) => {
	const { reactContent: bioPreviewContent } = useMarkdown(bio);

	return (
		<div
			className={css({
				padding: "token(spacing.2) token(spacing.4)",
				borderRadius: 6,
				borderWidth: 1,
				borderStyle: "solid",
				borderColor: "gray.300",
				outline: "none",
				width: "100%",
				height: "240px",
				overflowY: "auto",
			})}
		>
			<Document
				inlineOnly
				className={css({
					color: "gray.500",
					fontSize: "md",
					mdDown: {
						fontSize: "sm",
					},
				})}
			>
				{bioPreviewContent}
			</Document>
		</div>
	);
};
