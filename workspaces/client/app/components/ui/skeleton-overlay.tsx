import { css } from "styled-system/css";

interface Props {
	isLoading?: boolean;
}

export const SkeletonOverlay = ({ isLoading = false }: Props) => {
	return (
		<div
			className={css({
				opacity: isLoading ? 1 : 0,
				userSelect: "none",
				pointerEvents: "none",
				transition: "all",
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background:
					"linear-gradient(90deg, #f3f3f3 25%, #e0e0e0 37%, #f3f3f3 63%)",
				backgroundSize: "400% 400%",
				animation: "skeleton 1.4s infinite linear",
				width: "100%",
				height: "100%",
			})}
		/>
	);
};
