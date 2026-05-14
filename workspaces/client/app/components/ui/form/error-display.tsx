import { css, cx } from "styled-system/css";

interface Props {
	error?: string;
	center?: boolean;
	className?: string;
}

export const ErrorDisplay = ({ error, center, className }: Props) => {
	if (!error) {
		return null;
	}

	return (
		<p
			className={cx(
				css({
					color: "rose.600",
					fontSize: "sm",
				}),
				className,
			)}
			style={{ textAlign: center ? "center" : "start" }}
		>
			{error}
		</p>
	);
};
