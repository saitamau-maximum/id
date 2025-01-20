import { css } from "styled-system/css";
import { ProfileUpdateForm } from "./internal/components/form";
import { ProfileImageEditor } from "./internal/components/profile-image-editor";

export default function Settings() {
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
					Settings
				</h1>
				<span className={css({ color: "gray.500", fontSize: "md" })}>
					プロフィール情報を変更することができます
				</span>
			</div>
			<div
				className={css({
					width: "100%",
					height: "100%",
					gap: 8,
					display: "flex",

					lgDown: {
						flexDirection: "column",
					},
				})}
			>
				<ProfileImageEditor />
				<ProfileUpdateForm />
			</div>
		</div>
	);
}
