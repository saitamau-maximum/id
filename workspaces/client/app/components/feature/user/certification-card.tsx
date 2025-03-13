import { css } from "styled-system/css";
import type { UserCertification } from "~/types/certification";

interface Props {
	certifications: UserCertification[];
}

export const CertificationCard = ({ certifications }: Props) => {
	if (certifications.length === 0) {
		return (
			<p
				className={css({
					color: "gray.500",
					textAlign: "center",
					fontSize: "sm",
				})}
			>
				登録されている資格・試験はありません
			</p>
		);
	}

	return (
		<div
			className={css({
				display: "flex",
				alignItems: "center",
				justifyContent: "start",
			})}
		>
			{certifications.map((certification) => (
				<span
					className={css({
						display: "inline-block",
						padding: "token(spacing.1) token(spacing.2)",
						lineHeight: 1,
						borderRadius: 14,
						fontSize: 14,
						fontWeight: 500,
						border: "1px solid token(colors.gray.300)",
						margin: "token(spacing.1)",
						color: "gray.600",
					})}
					key={certification.id}
				>
					{certification.title}
				</span>
			))}
		</div>
	);
};
