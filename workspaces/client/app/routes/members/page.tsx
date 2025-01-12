import { Link } from "react-router";
import { css } from "styled-system/css";
import { ProfileCard } from "~/components/feature/user/profile-card";
import { useMembers } from "./internal/hooks/use-members";

export default function Members() {
	const { data } = useMembers();

	if (!data) {
		return null;
	}

	return (
		<div>
			<div
				className={css({
					marginBottom: 8,
				})}
			>
				<h1
					className={css({
						fontSize: "4xl",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					Members
				</h1>
				<span className={css({ color: "gray.500", fontSize: "md" })}>
					Maximum IDPに登録されているメンバーの一覧です
				</span>
			</div>
			<div
				className={css({
					display: "flex",
					flexWrap: "wrap",
					gap: 8,
				})}
			>
				{data.map((user) =>
					user.initialized ? (
						<Link
							key={user.id}
							to={`/members/${user.displayId}`}
							className={css({
								cursor: "pointer",
								borderRadius: "xl",
								padding: 2,
								transition: "background",
								_hover: {
									backgroundColor: "gray.100",
								},
							})}
						>
							<ProfileCard
								key={user.id}
								displayName={user.displayName}
								realName={user.realName}
								displayId={user.displayId}
								profileImageURL={user.profileImageURL}
								grade={user.grade}
								initialized={user.initialized}
							/>
						</Link>
					) : (
						<ProfileCard
							key={user.id}
							displayName={user.displayName}
							realName={user.realName}
							displayId={user.displayId}
							profileImageURL={user.profileImageURL}
							grade={user.grade}
							initialized={user.initialized}
						/>
					),
				)}
			</div>
		</div>
	);
}
