import { css } from "styled-system/css";
import { Document } from "~/components/ui/document";
import { useMarkdown } from "~/hooks/use-markdown";
import type { Member } from "~/types/user";
import { RoleBadge } from "./role-badge";

type Props = Omit<Member, "certifications"> & {
	shrinkRoles?: boolean;
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
	shrinkRoles = false,
}) => {
	const { reactContent: bioPreviewContent } = useMarkdown(bio);
	const trancatedRoles = shrinkRoles ? roles.slice(0, 3) : roles;
	const rolesLeft = roles.length - trancatedRoles.length;

	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				gap: 4,
				width: "100%",
			})}
		>
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
					<div
						className={css({ display: "flex", gap: 4, alignItems: "center" })}
					>
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
						{shrinkRoles && roles.length > 0 && (
							<div
								className={css({
									display: "flex",
									gap: 2,
									alignItems: "center",
									flexWrap: "wrap",
								})}
							>
								{trancatedRoles.map((role) => (
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
							gap: "0 token(spacing.4)",
							flexWrap: "wrap",
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
			{!shrinkRoles && roles.length > 0 && (
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
			{bio && (
				<Document
					inlineOnly
					className={css({
						color: "gray.500",
						fontSize: "md",
						mdDown: {
							fontSize: "sm",
						},
					})}
				>
					{bioPreviewContent}
				</Document>
			)}
		</div>
	);
};
