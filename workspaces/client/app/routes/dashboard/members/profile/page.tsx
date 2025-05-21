import { CheckCircle } from "react-feather";
import { useParams } from "react-router";
import { css } from "styled-system/css";
import { CertificationCard } from "~/components/feature/user/certification-card";
import { ContributionCard } from "~/components/feature/user/contribution/card";
import { ProfileCard } from "~/components/feature/user/profile-card";
import { useDeviceType } from "~/hooks/use-device-type";
import { useMemberContribution } from "./internal/hooks/use-member-contribution";
import { useMemberProfile } from "./internal/hooks/use-member-profie";

export default function Profile() {
	const { userDisplayId } = useParams<{
		userDisplayId: string;
	}>();
	const { deviceType } = useDeviceType();

	if (!userDisplayId) {
		return null;
	}

	const {
		data: memberProfile,
		isLoading: isMemberProfileLoading,
		isError: isMemberProfileError,
	} = useMemberProfile(userDisplayId);
	const { data: memberContribution, isLoading: isMemberContributionLoading } =
		useMemberContribution(userDisplayId);

	// めんどくさいのでとりあえずMemberProfileが読み込まれるまでは表示しない
	if (isMemberProfileLoading) {
		return null;
	}

	if (isMemberProfileError) {
		return (
			<div
				className={css({
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "100%",
				})}
			>
				ユーザーが見つかりませんでした
			</div>
		);
	}

	return (
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
					id={memberProfile?.id || ""}
					displayName={memberProfile?.displayName}
					realName={memberProfile?.realName}
					displayId={memberProfile?.displayId}
					profileImageURL={memberProfile?.profileImageURL}
					grade={memberProfile?.grade}
					initialized={!!memberProfile?.initializedAt}
					roles={memberProfile?.roles || []}
					bio={memberProfile?.bio}
					socialLinks={memberProfile?.socialLinks}
					lastLoginAt={memberProfile?.lastLoginAt}
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
				<CertificationCard
					certifications={memberProfile?.certifications || []}
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
						isLoading={isMemberContributionLoading}
						weeks={
							memberContribution?.weeks.map((week) =>
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
	);
}
