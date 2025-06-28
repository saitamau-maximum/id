import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { css } from "styled-system/css";
import { Document } from "~/components/ui/document";
import { Form } from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { useMarkdown } from "~/hooks/use-markdown";

interface Props {
	description: string;
	rows: number;
	error?: string;
	register: UseFormRegisterReturn;
	inlineOnly: boolean;
}

interface DescriptionPreviewProps {
	description: string;
	inlineOnly: boolean;
}

const DescriptionPreview = ({
	description,
	inlineOnly,
}: DescriptionPreviewProps) => {
	const { reactContent } = useMarkdown(description);
	return (
		<div
			className={css({
				height: "auto",
				maxHeight: "300px",
				overflowY: "auto",
				border: "1px solid",
				borderColor: "gray.300",
				padding: 2,
				borderRadius: "md",
			})}
		>
			<Document inlineOnly={inlineOnly}>{reactContent}</Document>
		</div>
	);
};

export const DescriptionFormField = ({
	description,
	rows,
	error,
	register,
	inlineOnly,
}: Props) => {
	const [isDescirptionPreviewShown, setIsDescirptionPreviewShown] =
		useState(false);
	return (
		<>
			<Switch.List>
				<Switch.Item
					isActive={!isDescirptionPreviewShown}
					onClick={() => setIsDescirptionPreviewShown(false)}
				>
					Edit
				</Switch.Item>
				<Switch.Item
					isActive={isDescirptionPreviewShown}
					onClick={() => setIsDescirptionPreviewShown(true)}
				>
					Preview
				</Switch.Item>
			</Switch.List>

			{isDescirptionPreviewShown ? (
				<DescriptionPreview description={description} inlineOnly={inlineOnly} />
			) : (
				<Form.Field.TextArea
					label="説明"
					rows={rows}
					error={error}
					{...register}
				/>
			)}
		</>
	);
};
