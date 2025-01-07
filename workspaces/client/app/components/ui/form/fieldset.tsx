import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"fieldset">;

export const FieldSet = ({ className, ...props }: Props) => {
	return (
		<fieldset
			{...props}
			className={cx(
				css({
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}),
				className,
			)}
		/>
	);
};
