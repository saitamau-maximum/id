import { css } from "styled-system/css";
import { useCertificationRequests } from "../hooks/use-certification-requests";

export const CertificationRequestList = () => {
	const { data: certificationRequests } = useCertificationRequests();

	return (
		<div>
			<h2
				className={css({
					fontSize: "xl",
					fontWeight: "bold",
					color: "gray.600",
				})}
			>
				資格・試験のリクエスト一覧
			</h2>
			<ul>
				{
					// WIP
					certificationRequests?.map((certificationRequest) => {
						return (
							<li
								key={`${certificationRequest.userId}:${certificationRequest.certificationId}`}
							>
								{certificationRequest.userId}:{" "}
								{certificationRequest.certificationId} (
								{certificationRequest.certifiedIn})
							</li>
						);
					})
				}
			</ul>
		</div>
	);
};
