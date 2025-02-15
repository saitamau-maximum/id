import { css } from "styled-system/css";
import type { Role } from "~/types/role";
import type { Member } from "~/types/user";
import { RoleBadge } from "./role-badge";

type Props = Member & {
	roles: Role[];
};

export const ProfileCard: React.FC<Props> = ({
	displayName,
	realName,
	displayId,
	profileImageURL,
	grade,
	initialized,
	roles,
	bio,
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
			<div
				className={css({
					width: "120px",
					height: "120px",
					borderRadius: "50%",
					flexShrink: 0,
					backgroundColor: "gray.100",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					mdDown: {
						width: "80px",
						height: "80px",
					},
				})}
			>
				{profileImageURL ? (
					<img
						className={css({
							width: "100%",
							aspectRatio: "1 / 1",
							objectFit: "cover",
							borderRadius: "50%",
						})}
						src={profileImageURL}
						alt={displayName}
					/>
				) : (
					<span
						className={css({
							color: "gray.500",
							fontSize: "4xl",
							mdDown: {
								fontSize: "3xl",
							},
						})}
					>
						{displayName?.charAt(0)}
					</span>
				)}
			</div>
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
					{roles.length > 0 && (
						<div
							className={css({
								display: "flex",
								gap: 2,
								alignItems: "center",
								flexWrap: "wrap",
							})}
						>
							{roles.map((role) => (
								<RoleBadge key={role.name} role={role} />
							))}
						</div>
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
				{bio && (
					<p
						className={css({
							color: "gray.500",
							fontSize: "md",
							mdDown: {
								fontSize: "sm",
							},
							maxWidth: "100%", // 親要素にフィットさせる
							overflowWrap: "break-word", // 単語が長すぎる場合に折り返す
							wordBreak: "break-word", // 単語内でも折り返しを行う
							lineHeight: "1.5", // 行間の調整
						})}
					>
						{bio}
					</p>
				)}
			</div>
		</div>
	);
};
