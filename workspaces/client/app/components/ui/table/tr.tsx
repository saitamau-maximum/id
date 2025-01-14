import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"tr">;

export const Tr = ({ children, className, ...props }: Props) => {
	return (
		<tr
			className={cx(
				css({
					"&:last-child": {
						"& td": {
							borderBottomWidth: 0,
						},
					},
				}),
				className,
			)}
			{...props}
		>
			{children}
		</tr>
	);
};
