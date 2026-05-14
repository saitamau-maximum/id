import { css } from "styled-system/css";

export const RequiredIndicator = () => {
	return (
		<span
			aria-hidden="true"
			className={css({
				color: "red",
				marginLeft: "token(spacing.1)",
			})}
		>
			*
		</span>
	);
};
