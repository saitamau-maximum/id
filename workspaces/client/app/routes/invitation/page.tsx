import { useEffect } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
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
					pushToast({
						type: "error",
						title:
							"招待コードの取得に失敗しました。時間をおいて再度お試しください。",
					});
					throw new Error("Failed to fetch invitation");
				}
				navigate("/login");
			} catch (error) {
				pushToast({
					type: "error",
					title:
						"招待コードの取得に失敗しました。時間をおいて再度お試しください。",
				});
				console.error("Error fetching invitation:", error);
			}
		};
		fetchInvitation();
	}, [id, navigate, pushToast]);

	return (
		// TODO: fix me
		<div>
			<h1>Redirecting...</h1>
			<p>Invitation ID: {id}</p>
		</div>
	);
}
