import { css } from "styled-system/css";

interface Props {
	error?: string;
}

export const ErrorDisplay = ({ error }: Props) => {
	if (!error) {
		return null;
	}

	return <p className={css({ color: "red.600", fontSize: "sm" })}>{error}</p>;
};
