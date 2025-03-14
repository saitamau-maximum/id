import { css } from "styled-system/css";
import type { Certification } from "~/types/certification";

interface Props {
	certifications: Certification[];
}

export const CertificationTable = ({ certifications }: Props) => {
	return (
		<div>
			<h2
				className={css({
					fontSize: "xl",
					fontWeight: "bold",
					color: "gray.600",
					marginTop: 6,
					marginBottom: 4,
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
