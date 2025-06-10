import { CheckCircle } from "react-feather";
import { css } from "styled-system/css";
import { CertificationCard } from "~/components/feature/user/certification-card";
import { ContributionCard } from "~/components/feature/user/contribution/card";
import { ProfileCard } from "~/components/feature/user/profile-card";
import { useAuth } from "~/hooks/use-auth";
import { useDeviceType } from "~/hooks/use-device-type";
import { DiscordInvitationMessageBox } from "./internal/components/discord-invitation-message-box";
import { PaymentMessageBox } from "./internal/components/payment-message-box";
import { ProfileUpdateMessageBox } from "./internal/components/profile-update-message-box";
import { useContribution } from "./internal/hooks/use-contribution";
import { useDiscordInfo } from "./internal/hooks/use-discord-info";

export default function Home() {
	const { user, hasFiscalYearUpdated, isFiscalYearPaid } = useAuth();
	const { data, isLoading } = useContribution();
	const { deviceType } = useDeviceType();
	const { data: discordInfo } = useDiscordInfo(user?.displayId);

	if (!user) {
		return null;
	}

	// 仮実装として、いったん全員に Discord 招待メッセージを表示するようにする
	const userJoinedDiscord = false;

	return (
		<>
			{!hasFiscalYearUpdated && <ProfileUpdateMessageBox />}
			{!userJoinedDiscord && <DiscordInvitationMessageBox />}
			{!isFiscalYearPaid && <PaymentMessageBox />}
			<div
				className={css({
					width: "100%",
					maxWidth: "1200px",
					marginTop: 32,
					display: "grid",
					gridTemplateColumns: "repeat(1, 1fr)",
					placeItems: "center",
					"@dashboard/4xl": {
						gridTemplateColumns: "480px 360px",
						placeItems: "start",
					},
					justifyContent: "center",
					gap: 16,
				})}
			>
				<div className={css({ width: "100%", maxWidth: "480px" })}>
					<ProfileCard
						id={user.id}
						displayName={user.displayName}
						realName={user.realName}
						displayId={user.displayId}
						profileImageURL={user.profileImageURL}
						grade={user.grade}
						initialized={!!user.initializedAt}
						roles={user.roles}
						bio={user.bio}
						socialLinks={user.socialLinks}
						lastLoginAt={user.lastLoginAt}
						discordInfo={discordInfo}
					/>
				</div>
				<div className={css({ width: "100%", maxWidth: "480px" })}>
					<h2
						className={css({
							fontSize: "2xl",
							fontWeight: "bold",
							color: "gray.600",
						})}
					>
						Achievements
					</h2>
					<p
						className={css({
							color: "gray.500",
							fontSize: "sm",
							marginBottom: 4,
						})}
					>
						経歴・資格情報など
					</p>
					<h3
						className={css({
							fontSize: "md",
							fontWeight: "bold",
							color: "gray.600",
							marginBottom: 2,
							display: "flex",
							alignItems: "center",
							gap: 2,
						})}
					>
						<CheckCircle size={16} />
						資格・試験
					</h3>
					<CertificationCard certifications={user.certifications} />
				</div>
				<div className={css({ width: "100%", maxWidth: "480px" })}>
					<h2
						className={css({
							fontSize: "2xl",
							fontWeight: "bold",
							color: "gray.600",
						})}
					>
						Activities
					</h2>
					<p
						className={css({
							color: "gray.500",
							fontSize: "sm",
							marginBottom: 4,
						})}
					>
						Maximumでの活動度によって色がつきます
					</p>
					<div
						className={css({
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						})}
					>
						<ContributionCard
							isLoading={isLoading}
							weeks={
								data?.weeks.map((week) =>
									week.map((day) => ({
										...day,
										date: new Date(day.date),
									})),
								) || []
							}
							clip={14}
							size={deviceType === "sp" ? "sm" : "md"}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
