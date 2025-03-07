import { css } from "styled-system/css";

interface Props {
	error?: string;
	center?: boolean;
}

export const ErrorDisplay = ({ error, center }: Props) => {
	if (!error) {
		return null;
	}

	return (
		<p
			className={css({
				color: "rose.600",
				fontSize: "sm",
			})}
			style={{ textAlign: center ? "center" : "start" }}
		>
			{error}
		</p>
	);
};
