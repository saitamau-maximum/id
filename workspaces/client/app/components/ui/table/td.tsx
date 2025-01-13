import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"td">;

export const Td = ({ children, className, ...props }: Props) => {
	return (
		<td
			className={cx(
				css({
					padding: 2,
					color: "gray.700",
					borderBottomWidth: 1,
					borderBottomStyle: "solid",
					borderBottomColor: "gray.200",
				}),
				className,
			)}
			{...props}
		>
			{children || "-"}
		</td>
	);
};
