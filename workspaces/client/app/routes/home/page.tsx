import { css } from "styled-system/css";
import { ProfileCard } from "~/components/feature/user/profile-card";

import { ContributionCard } from "~/components/feature/user/contribution/card";
import { useAuth } from "~/hooks/use-auth";
import { useContribution } from "./internal/hooks/use-contribution";

export default function Home() {
	const { user } = useAuth();
	const { data, isLoading } = useContribution();

	if (!user) {
		return null;
	}

	return (
		<div
			className={css({
				width: "100%",
				maxWidth: "1200px",
				marginTop: 32,
				display: "grid",
				gridTemplateColumns: "repeat(2, max-content)",
				justifyContent: "center",
				placeItems: "center",
				gap: 16,
				padding: 4,
				lgDown: {
					gridTemplateColumns: "repeat(1, 1fr)",
				},
			})}
		>
			<ProfileCard
				displayName={user.displayName ?? ""}
				realName={user.realName ?? ""}
				displayId={user.displayId ?? ""}
				profileImageURL={user.profileImageURL ?? ""}
				grade={user.grade ?? ""}
			/>
			<ContributionCard
				weeks={
					data?.weeks.map((week) =>
						week.map((day) => ({
							...day,
							date: new Date(day.date),
						})),
					) || []
				}
				clip={14}
			/>
		</div>
	);
}
