import { css } from "styled-system/css";
import { ProfileUpdateForm } from "./internal/components/form";

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
					maxWidth: 1200,
					margin: "auto",
					padding: "token(spacing.8) token(spacing.4)",
					gap: 8,
					_after: {
						content: "''",
						display: "block",
						width: "100%",
						height: "token(spacing.8)", // スクロール時にパディング分が消えないようにするハック
					},
				})}
			>
				<ProfileUpdateForm />
			</div>
		</div>
	);
}
