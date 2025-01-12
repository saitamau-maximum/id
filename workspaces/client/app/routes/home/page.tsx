import { css } from "styled-system/css";
import { ProfileCard } from "~/components/feature/user/profile-card";

import { useAuth } from "~/hooks/useAuth";

export default function Home() {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<div
			className={css({
				width: "100%",
				maxWidth: "1200px",
				height: "100%",
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gridTemplateRows: "1fr 1fr",
				justifyContent: "center",
				placeItems: "center",
				gap: 8,
				padding: 4,
				lgDown: {
					gridTemplateColumns: "1fr",
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
		</div>
	);
}
