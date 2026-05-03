import { useState } from "react";
import type { FieldValues, Path, useForm } from "react-hook-form";
import { css } from "styled-system/css";
import { Document } from "~/components/ui/document";
import { Form } from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { useMarkdown } from "~/hooks/use-markdown";

interface Props<T extends FieldValues> {
	// useFormContext を使うと register, watch を props で渡す必要がなくなるが、
	// 現状そのためだけに context を作るのも微妙なので、 props で渡す形にしている
	// 今後の拡張で context が必要になったら useFormContext を使う形にすると良いかも
	register: ReturnType<typeof useForm<T>>["register"];
	watch: ReturnType<typeof useForm<T>>["watch"];
	name: Path<T>;
	placeholder?: string;
	maxLines?: number;
	maxLength?: number;
}

export const PreviewableField = <T extends FieldValues>({
	name,
	placeholder,
	maxLines,
	maxLength,
	register,
	watch,
}: Props<T>) => {
	const [isPreview, setIsPreview] = useState(false);
	const content = watch(name);
	const length = content ? content.length : 0;

	return (
		<>
			<Switch.List>
				<Switch.Item
					isActive={!isPreview}
					onClick={() => setIsPreview(!isPreview)}
				>
					Edit
				</Switch.Item>
				<Switch.Item
					isActive={isPreview}
					onClick={() => setIsPreview(!isPreview)}
				>
					Preview
				</Switch.Item>
			</Switch.List>
			{isPreview ? (
				<MdPreview content={content} />
			) : (
				<div className={css({ height: "240px" })}>
					<Form.Textarea
						placeholder={placeholder}
						rows={maxLines}
						{...register(name)}
					/>
				</div>
			)}
			{maxLength && (
				<p
					className={css({
						display: "block",
						fontSize: "sm",
						color: "gray.600",
						textAlign: "right",
					})}
				>
					{length} / {maxLength}
				</p>
			)}
		</>
	);
};

const MdPreview = ({ content }: { content?: string }) => {
	const { reactContent } = useMarkdown(content);

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
				{reactContent}
			</Document>
		</div>
	);
};
