import { useEffect } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { env } from "~/utils/env";

export default function Invitation() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchInvitation = async () => {
			try {
				const response = await fetch(`${env("SERVER_HOST")}/invite/${id}`, {
					credentials: "include",
				});
				if (!response.ok) {
					throw new Error("Failed to fetch invitation");
				}
				navigate("/login");
			} catch (error) {
				console.error("Error fetching invitation:", error);
			}
		};
		fetchInvitation();
	}, [id, navigate]);

	return (
		// TODO: fix me
		<div>
			<h1>Redirecting...</h1>
			<p>Invitation ID: {id}</p>
		</div>
	);
}
