import { Link } from "react-router";
import { css } from "styled-system/css";

interface Props {
	name: string;
	displayId: string;
	iconURL: string;
}

export const UserDisplay = ({ name, displayId, iconURL }: Props) => {
	return (
		<Link
			to={`/members/${displayId}`}
			className={css({
				display: "inline-flex",
				verticalAlign: "middle",
				marginLeft: 2,
				marginRight: 2,
				alignItems: "center",
				gap: 2,
				width: "max-content",
				color: "gray.700",
				transition: "all",

				"&:hover": {
					textDecoration: "underline",
					color: "gray.800",
				},
			})}
		>
			{iconURL && (
				<img
					src={iconURL}
					alt={name}
					width={20}
					height={20}
					className={css({
						borderRadius: "full",
						width: "20px",
						height: "20px",
						objectFit: "cover",
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
		</Link>
	);
};
