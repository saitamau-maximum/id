import { Link } from "react-router";
import { css } from "styled-system/css";

interface Props {
	name: string;
	displayId: string;
	iconURL?: string;
	link?: boolean;
}

export const UserDisplay = ({
	name,
	displayId,
	iconURL,
	link = false,
}: Props) => {
	const Component = link ? Link : "div";

	return (
		<Component
			to={`/members/${displayId}`}
			className={css({
				display: "inline-flex",
				alignItems: "center",
				verticalAlign: "middle",
				gap: 2,
				width: "max-content",
				color: "gray.700",
				transition: "all",

				"&:hover": link
					? {
							textDecoration: "underline",
							color: "gray.800",
						}
					: {},
			})}
		>
			{iconURL && (
				<img
					src={iconURL}
					alt={name}
					width={24}
					height={24}
					className={css({
						borderRadius: "full",
						width: "24px",
						height: "24px",
						objectFit: "cover",
						border: "1px solid",
						borderColor: "gray.200",
					})}
				/>
			)}
			<span
				className={css({
					whiteSpace: "nowrap",
				})}
			>
				{name}
			</span>
		</Component>
	);
};
