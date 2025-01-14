import { type ComponentProps, useId } from "react";
import { css, cx } from "styled-system/css";

type SelectProps = Exclude<ComponentProps<"input">, "type"> & {
	label: string;
};

export const Select = ({ className, label, ...props }: SelectProps) => {
	const id = useId();
	return (
		<label
			className={css({
				display: "flex",
				alignItems: "center",
				borderRadius: 6,
				padding: "token(spacing.1) token(spacing.2)",
				borderWidth: 1,
				borderStyle: "solid",
				borderColor: "gray.300",
				backgroundColor: "white",
				cursor: "pointer",
				transition: "border-color 0.2s ease",
				"&:hover": {
					borderColor: "green.600",
				},
				"&:has(>input[type='checkbox']:checked)": {
					borderColor: "green.600",
				},
			})}
		>
			<input
				{...props}
				type="checkbox"
				id={id}
				className={cx(
					css({
						// a11yを担保しつつデザインするためのかくし要素
						clip: "rect(0 0 0 0)",
						clipPath: "inset(50%)",
						height: 1,
						overflow: "hidden",
						position: "absolute",
						whiteSpace: "nowrap",
						width: 1,
					}),
					className,
				)}
			/>
			<span
				className={css({
					display: "inline-block",
					verticalAlign: "middle",
					marginRight: "token(spacing.2)",
					width: 3,
					height: 3,
					borderRadius: "sm",
					borderWidth: 1,
					borderStyle: "solid",
					borderColor: "gray.300",
					outlineWidth: 1,
					outlineStyle: "solid",
					outlineColor: "transparent",
					backgroundColor: "white",
					transition: ["background"],

					'input[type="checkbox"]:checked + &': {
						backgroundColor: "green.600",
						borderColor: "white",
						outlineColor: "green.600",
					},
				})}
			/>
			<span
				className={css({
					fontSize: "sm",
					color: "gray.600",
					userSelect: "none",
				})}
			>
				{label}
			</span>
		</label>
	);
};

interface SelectGroupProps {
	children: React.ReactNode;
}

export const SelectGroup = ({ children }: SelectGroupProps) => {
	return (
		<div
			className={css({
				display: "flex",
				gap: "token(spacing.2)",
				flexWrap: "wrap",
			})}
		>
			{children}
		</div>
	);
};
