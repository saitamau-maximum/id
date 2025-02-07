import { css } from "styled-system/css";

interface Props {
	children: React.ReactNode;
}

export const BreadcrumbItem = ({ children }: Props) => {
	return (
		<li
			className={css({
				display: "inline-block",
				color: "gray.500",
				lineHeight: "1",

				transition: "color",

				_last: {
					color: "gray.700",
				},

				"&:not(:last-child):hover": {
					color: "gray.700",
				},
			})}
		>
			{children}
		</li>
	);
};
