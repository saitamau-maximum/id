import { useParams } from "react-router";
import { css } from "styled-system/css";
import { ContributionCard } from "~/components/feature/user/contribution/card";
import { ProfileCard } from "~/components/feature/user/profile-card";
import { useMemberContribution } from "./internal/hooks/use-member-contribution";
import { useMemberProfile } from "./internal/hooks/use-member-profie";

export default function Profile() {
	const { userDisplayId } = useParams<{
		userDisplayId: string;
	}>();

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
				gridTemplateColumns: "470px max-content",
				justifyContent: "center",
				placeItems: "center",
				gap: 16,
				lgDown: {
					gridTemplateColumns: "repeat(1, 1fr)",
				},
			})}
		>
			<ProfileCard
				id={memberProfile?.id || ""}
				displayName={memberProfile?.displayName}
				realName={memberProfile?.realName}
				displayId={memberProfile?.displayId}
				profileImageURL={memberProfile?.profileImageURL}
				grade={memberProfile?.grade}
				initialized={memberProfile?.initialized || false}
				roles={memberProfile?.roles || []}
				bio={memberProfile?.bio}
			/>
			<div>
				<h1
					className={css({
						fontSize: "2xl",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					Activities
				</h1>
				<p
					className={css({
						color: "gray.500",
						fontSize: "sm",
						marginBottom: 4,
					})}
				>
					Maximumでの活動度によって色がつきます
				</p>
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
				/>
			</div>
		</div>
	);
}
