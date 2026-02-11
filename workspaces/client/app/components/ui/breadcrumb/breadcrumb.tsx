import { Fragment } from "react/jsx-runtime";
import { ChevronRight, Home } from "react-feather";
import { Link } from "react-router";
import { css } from "styled-system/css";
import { BreadcrumbItem } from "./breadcrumb-item";

interface Props {
	items: {
		label: string;
		to?: string;
	}[];
}

const breadcrumbLinkStyle = css({
	display: "inline-flex",
	alignItems: "center",
	gap: 2,
	padding: "2",
	margin: "-2",
});

export const Breadcrumb = ({ items }: Props) => {
	return (
		<nav
			aria-label="Breadcrumb"
			className={css({
				display: "flex",
				alignItems: "center",

				gap: 2,
				color: "gray.500",
				_last: {
					color: "gray.700",
				},
			})}
		>
			{items.map((item, index) => (
				<Fragment key={item.label}>
					<BreadcrumbItem>
						{item.to && index !== items.length - 1 ? (
							<Link to={item.to} className={breadcrumbLinkStyle}>
								{index === 0 && <Home size={20} />}
								{item.label}
							</Link>
						) : (
							<span className={breadcrumbLinkStyle}>
								{index === 0 && <Home size={20} />}
								{item.label}
							</span>
						)}
					</BreadcrumbItem>
					{index < items.length - 1 && <ChevronRight size={16} />}
				</Fragment>
			))}
		</nav>
	);
};
