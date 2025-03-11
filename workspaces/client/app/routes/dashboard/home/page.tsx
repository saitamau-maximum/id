import { CheckCircle } from "react-feather";
import { css } from "styled-system/css";
import { CertificationCard } from "~/components/feature/user/certification-card";
import { ContributionCard } from "~/components/feature/user/contribution/card";
import { ProfileCard } from "~/components/feature/user/profile-card";
import { useAuth } from "~/hooks/use-auth";
import { useDeviceType } from "~/hooks/use-device-type";
import { FLAG } from "~/utils/flag";
import { useContribution } from "./internal/hooks/use-contribution";

export default function Home() {
	const { user } = useAuth();
	const { data, isLoading } = useContribution();
	const { deviceType } = useDeviceType();

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
				gridTemplateColumns: {
					"@dashboard/4xl": "480px 360px",
					base: "repeat(1, 1fr)",
				},
				justifyContent: "center",
				placeItems: "start",
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
					initialized={user.initialized}
					roles={user.roles}
					bio={user.bio}
				/>
			</div>
			<div className={css({ width: "100%", maxWidth: "480px" })}>
				{FLAG.ENABLE_CERTIFICATION && (
					<>
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
								fontSize: "lg",
								fontWeight: "bold",
								color: "gray.600",
								marginBottom: 2,
							})}
						>
							<CheckCircle
								size={20}
								className={css({
									display: "inline-block",
									marginRight: 2,
								})}
							/>
							資格・試験
						</h3>
						<div
							className={css({
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							})}
						>
							<CertificationCard certifications={user.certifications} />
						</div>
					</>
				)}
				<h2
					className={css({
						fontSize: "2xl",
						fontWeight: "bold",
						color: "gray.600",
						marginTop: 8,
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
	);
}
