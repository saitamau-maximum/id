import { css } from "styled-system/css";

interface Props {
	children: React.ReactNode;
}

export const NotFoundMessage = ({ children }: Props) => {
	return (
		<p
			className={css({
				textAlign: "center",
				color: "gray",
				marginTop: 16,
				marginBottom: 16,
			})}
		>
			{children}
		</p>
	);
};
