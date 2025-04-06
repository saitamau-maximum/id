import type { ComponentProps } from "react";
import { css, cx } from "styled-system/css";

type Props = ComponentProps<"span">;

export const AnchorLike = ({ className, ...props }: Props) => {
	return (
		<span
			{...props}
			className={cx(
				className,
				css({
					display: "inline-flex",
					alignItems: "center",
					gap: 1,
					color: "green.600",
					textDecoration: "underline",
					transition: "color",
					_hover: {
						color: "green.700",
					},
				}),
			)}
		/>
	);
};
