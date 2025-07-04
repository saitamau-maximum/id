import { css } from "styled-system/css";
import { Document } from "~/components/ui/document";
import { SocialIcon } from "~/components/ui/social-icon";
import { SOCIAL_SERVICES_IDS } from "~/constant";
import { useMarkdown } from "~/hooks/use-markdown";
import type { DiscordInfo } from "~/types/discord-info";
import type { Member } from "~/types/user";
import { isNowLoggedIn } from "~/utils/auth-ping";
import { formatDateTime } from "~/utils/date";
import { parseSocialLink } from "~/utils/social-link";
import { RoleBadge } from "./role-badge";

type Props = Omit<Member, "certifications" | "initializedAt"> & {
	socialLinks?: string[];
	initialized: boolean;
	lastLoginAt?: Date | undefined;
	discordInfo?: DiscordInfo;
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
	socialLinks,
	lastLoginAt,
	discordInfo,
}) => {
	const { reactContent: bioPreviewContent } = useMarkdown(bio);

	const socialLinksDetail = socialLinks?.map((link: string) => {
		const { service, handle } = parseSocialLink(link);
		return {
			service,
			handle,
			url: link,
		};
	});

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
					{isNowLoggedIn(lastLoginAt) ? (
						<span
							className={css({
								color: "green.600",
								fontSize: "sm",
								marginTop: 2,
							})}
						>
							現在ログイン中
						</span>
					) : (
						<span
							className={css({
								color: "gray.500",
								fontSize: "sm",
								marginTop: 2,
							})}
						>
							最終ログイン: {lastLoginAt ? formatDateTime(lastLoginAt) : "-"}
						</span>
					)}
				</div>
			</div>
			<div className={css({ display: "flex", gap: 4, flexWrap: "wrap" })}>
				<div
					className={css({
						display: "flex",
						flexDirection: "column",
						gap: "4px",
						alignItems: "flex-start",
						minWidth: "120px",
					})}
				>
					{discordInfo?.status === "joined" && (
						<span
							className={css({
								display: "flex",
								alignItems: "center",
								gap: 2,
								textDecoration: "none",
							})}
						>
							<SocialIcon service={SOCIAL_SERVICES_IDS.DISCORD} />
							<span
								className={css({
									color: "gray.600",
									fontSize: "sm",
									mdDown: {
										fontSize: "sm",
									},
								})}
							>
								{discordInfo.displayName}
							</span>
						</span>
					)}
					{(socialLinksDetail ?? []).map((link) => (
						<a
							key={link.url}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className={css({
								display: "flex",
								alignItems: "center",
								gap: 2,
								textDecoration: "none",
							})}
						>
							<SocialIcon service={link.service} />
							<span
								className={css({
									color: "gray.600",
									fontSize: "sm",
									mdDown: {
										fontSize: "sm",
									},
									_hover: {
										color: "gray.800",
									},
								})}
							>
								{link.handle}
							</span>
						</a>
					))}
				</div>
				<div>
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
			</div>
		</div>
	);
};
