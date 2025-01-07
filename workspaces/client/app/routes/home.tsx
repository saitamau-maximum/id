import { css } from "styled-system/css";

import { useAuth } from "~/hooks/useAuth";

export default function Home() {
	const { user } = useAuth();

	return (
		<div
			className={css({
				width: "100%",
				height: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				gap: 8,
				fontSize: "2xl",
				fontWeight: "bold",
				textAlign: "center",
			})}
		>
			<img
				className={css({
					width: "200px",
					height: "200px",
					borderRadius: "50%",
				})}
				src={user?.profileImageURL}
				alt={user?.displayName}
			/>
			<div>
				Authrized! Welcome to Maximum IDP!
				<p>Your user id is {user?.id}</p>
				<p>Your display name is {user?.displayName}</p>
			</div>
		</div>
	);
}
