import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { useToast } from "~/hooks/use-toast";
import { env } from "~/utils/env";

export default function Invitation() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { pushToast } = useToast();

	useEffect(() => {
		const fetchInvitation = async () => {
			try {
				const response = await fetch(`${env("SERVER_HOST")}/invite/${id}`, {
					credentials: "include",
				});
				if (!response.ok) {
					throw new Error("Failed to fetch invitation");
				}
				setTimeout(() => {
					navigate("/login");
				}, 1800);
			} catch (error) {
				pushToast({
					type: "error",
					title: "招待コードの取得に失敗しました",
					description:
						"時間をおいて再度お試しください。もし直らなければ Admin に連絡してください。",
				});
			}
		};
		fetchInvitation();
	}, [id, navigate, pushToast]);

	function AnimatedDots() {
		const [dots, setDots] = useState("");
		useEffect(() => {
			const interval = setInterval(() => {
				setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
			}, 250);
			return () => clearInterval(interval);
		}, []);
		return (
			<span
				className={css({
					display: "inline-block",
					width: "1.5em",
					textAlign: "left",
				})}
			>
				{dots}
			</span>
		);
	}

	return (
		<div
			className={css({
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				gap: 8,
				padding: 4,
			})}
		>
			<p
				className={css({
					textAlign: "center",
					color: "gray.600",
					lineHeight: 2,
				})}
			>
				招待ユーザー向けのログイン画面に遷移します
				<AnimatedDots />
			</p>
			<p
				className={css({
					textAlign: "center",
					color: "gray.600",
					lineHeight: 2,
				})}
			>
				招待コード: {id}
			</p>
		</div>
	);
}
