import { css } from "styled-system/css";

interface Props {
	profileImageURL: string;
	displayName?: string;
	realName?: string;
	displayId?: string;
	grade?: string;
	initialized: boolean;
}

export const ProfileCard: React.FC<Props> = ({
	displayName,
	realName,
	displayId,
	profileImageURL,
	grade,
	initialized,
}) => {
	return (
		<div
			className={css({
				display: "flex",
				alignItems: "center",
				gap: 8,
				mdDown: {
					gap: 4,
				},
			})}
		>
			<img
				className={css({
					width: "120px",
					height: "120px",
					borderRadius: "50%",
					mdDown: {
						width: "80px",
						height: "80px",
					},
				})}
				width={120}
				height={120}
				src={profileImageURL}
				alt={displayName}
			/>
			<div>
				<div className={css({ display: "flex", gap: 4, alignItems: "center" })}>
					{grade && (
						<span
							className={css({
								color: "gray.500",
								fontWeight: "bold",
								fontSize: "md",
								mdDown: {
									fontSize: "sm",
								},
							})}
						>
							{grade}
						</span>
					)}
					{!initialized && (
						<div
							className={css({
								backgroundColor: "blue.100",
								borderWidth: 2,
								borderStyle: "solid",
								borderColor: "blue.300",
								color: "blue.500",
								padding: "token(spacing.1) token(spacing.4)",
								borderRadius: 8,
								fontSize: "sm",
							})}
						>
							初期登録中
						</div>
					)}
				</div>
				<div
					className={css({
						display: "flex",
						alignItems: "center",
						gap: 4,
						marginBottom: 1,
						mdDown: {
							marginBottom: 0,
						},
					})}
				>
					{displayName && (
						<h1
							className={css({
								fontSize: "3xl",
								fontWeight: "bold",
								color: "gray.600",
								mdDown: {
									fontSize: "2xl",
								},
							})}
						>
							{displayName}
						</h1>
					)}
					{realName && (
						<span
							className={css({
								color: "gray.500",
								fontSize: "xl",
								mdDown: {
									fontSize: "lg",
								},
							})}
						>
							{realName}
						</span>
					)}
				</div>
				{displayId && (
					<p
						className={css({
							color: "gray.600",
							fontSize: "md",
							mdDown: {
								fontSize: "sm",
							},
						})}
					>
						@{displayId}
					</p>
				)}
			</div>
		</div>
	);
};
