import { css } from "styled-system/css";
import { ContributionCard } from "~/components/feature/user/contribution/card";
import { ProfileCard } from "~/components/feature/user/profile-card";
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
				id={user.id}
				displayName={user.displayName}
				realName={user.realName}
				displayId={user.displayId}
				profileImageURL={user.profileImageURL}
				grade={user.grade}
				initialized={user.initialized}
				roles={user.roles}
				bio={user.bio}
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
				/>
			</div>
		</div>
	);
}
