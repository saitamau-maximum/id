import { css } from "styled-system/css";

interface Props {
	displayName: string;
	realName: string;
	displayId: string;
	profileImageURL: string;
	grade: string;
}

export const ProfileCard: React.FC<Props> = ({
	displayName,
	realName,
	displayId,
	profileImageURL,
	grade,
}) => {
	return (
		<div className={css({ display: "flex", alignItems: "center", gap: 8 })}>
			<img
				className={css({
					width: "120px",
					height: "120px",
					borderRadius: "50%",
				})}
				width={120}
				height={120}
				src={profileImageURL}
				alt={displayName}
			/>
			<div>
				<div className={css({ display: "flex", gap: 4 })}>
					<span className={css({ color: "gray.500", fontWeight: "bold" })}>
						{grade}
					</span>
				</div>
				<div
					className={css({
						display: "flex",
						alignItems: "center",
						gap: 4,
						marginBottom: 1,
					})}
				>
					<h1
						className={css({
							fontSize: "3xl",
							fontWeight: "bold",
							color: "gray.600",
						})}
					>
						{displayName}
					</h1>
					<span
						className={css({
							color: "gray.500",
							fontSize: "xl",
						})}
					>
						{realName}
					</span>
				</div>
				<p
					className={css({
						color: "gray.600",
					})}
				>
					@{displayId}
				</p>
			</div>
		</div>
	);
};
