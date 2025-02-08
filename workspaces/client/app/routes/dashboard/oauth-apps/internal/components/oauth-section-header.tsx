import { css } from "styled-system/css";
import { Breadcrumb } from "~/components/ui/breadcrumb";

interface Props {
	title: string;
	children?: React.ReactNode;
	breadcrumb: {
		label: string;
		to?: string;
	}[];
}

export const OAuthSectionHeader = ({ title, children, breadcrumb }: Props) => {
	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				gap: 2,
				marginBottom: 4,
			})}
		>
			<Breadcrumb items={breadcrumb} />
			<div
				className={css({
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 8,
					height: "48px",
				})}
			>
				<h2
					className={css({
						fontSize: "2xl",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					{title}
				</h2>
				{children}
			</div>
		</div>
	);
};
