import { css } from "styled-system/css";
import { useCertifications } from "../hooks/use-certifications";

export const CertificationTable = () => {
	const { data: certifications } = useCertifications();

	return (
		<div>
			<h2
				className={css({
					fontSize: "xl",
					fontWeight: "bold",
					color: "gray.600",
				})}
			>
				資格・試験の一覧
			</h2>
			<ul>
				{
					// WIP
					certifications?.map((certification) => {
						return (
							<li key={certification.id}>
								{certification.id}: {certification.title} (
								{certification.description})
							</li>
						);
					})
				}
			</ul>
		</div>
	);
};
