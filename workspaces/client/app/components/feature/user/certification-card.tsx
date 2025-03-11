import { css } from "styled-system/css";
import type { Certification } from "~/types/certification";

interface Props {
	certifications?: Certification[];
}

export const CertificationCard = ({ certifications = [] }: Props) => {
	return (
		<div
			className={css({
				display: "flex",
				alignItems: "center",
				justifyContent: "start",
			})}
		>
			{certifications.length === 0 ? (
				<p
					className={css({
						color: "gray.500",
					})}
				>
					登録されている資格・試験はありません
				</p>
			) : (
				certifications.map((certification) => (
					<span
						className={css({
							display: "inline-block",
							padding: "token(spacing.1) token(spacing.2)",
							lineHeight: 1,
							borderRadius: 14,
							fontSize: 14,
							fontWeight: 500,
							border: "1px solid #c7c7c7",
							margin: "token(spacing.1)",
						})}
						key={certification.id}
					>
						{certification.title}
					</span>
				))
			)}
		</div>
	);
};
