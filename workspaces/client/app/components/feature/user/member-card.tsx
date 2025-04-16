import { Link } from "react-router";
import { css } from "styled-system/css";
import type { Member } from "~/types/user";
import { RoleBadge } from "./role-badge";

type Props = Omit<Member, "certifications" | "bio"> & {
	displayOnly?: boolean;
};

export const MemberCard: React.FC<Props> = ({
	id,
	displayName,
	realName,
	displayId,
	profileImageURL,
	grade,
	roles,
	displayOnly = false,
}) => {
	const truncatedRoles = roles.slice(0, 3);
	const rolesLeft = roles.length - truncatedRoles.length;

	const Inner = (
		<div
			className={css({
				display: "flex",
				alignItems: "center",
				padding: 2,
				gap: 4,
				mdDown: {
					gap: 3,
				},
			})}
		>
			<div
				className={css({
					width: "80px",
					height: "80px",
					borderRadius: "50%",
					flexShrink: 0,
					backgroundColor: "gray.100",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					mdDown: {
						width: "64px",
						height: "64px",
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
							fontSize: "2xl",
							mdDown: {
								fontSize: "xl",
							},
						})}
					>
						{displayName?.charAt(0)}
					</span>
				)}
			</div>
			<div>
				<div
					className={css({
						display: "flex",
						gap: "token(spacing.1) token(spacing.2)",
						alignItems: "center",
						flexWrap: "wrap",
					})}
				>
					{grade && (
						<span
							className={css({
								color: "gray.500",
								fontWeight: "bold",
								fontSize: "md",
								whiteSpace: "nowrap",
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
							{truncatedRoles.map((role) => (
								<RoleBadge key={role.name} role={role} />
							))}
							{rolesLeft > 0 && (
								<span
									className={css({
										color: "gray.500",
										fontSize: "md",
										mdDown: {
											fontSize: "sm",
										},
									})}
								>
									+{rolesLeft}
								</span>
							)}
						</div>
					)}
				</div>
				<div
					className={css({
						display: "flex",
						alignItems: "center",
						gap: "0 token(spacing.4)",
						flexWrap: "wrap",
						mdDown: {
							gap: "0 token(spacing.2)",
						},
					})}
				>
					{displayName && (
						<h1
							className={css({
								fontSize: "2xl",
								fontWeight: "bold",
								color: "gray.600",
								mdDown: {
									fontSize: "xl",
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
								fontSize: "lg",
								mdDown: {
									fontSize: "md",
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

	if (displayOnly) {
		return Inner;
	}

	return (
		<Link
			key={id}
			to={`/members/${displayId}`}
			className={css({
				cursor: "pointer",
				borderRadius: "xl",
				transition: "background",
				_hover: {
					backgroundColor: "gray.100",
				},
			})}
		>
			{Inner}
		</Link>
	);
};
