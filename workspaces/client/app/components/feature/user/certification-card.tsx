import { AlertCircle } from "react-feather";
import { css } from "styled-system/css";
import type { UserCertification } from "~/types/certification";

interface Props {
	certifications: UserCertification[];
	onClick?: (certification: UserCertification) => void;
}

export const CertificationCard = ({ certifications, onClick }: Props) => {
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
						display: "inline-flex",
						padding: "token(spacing.1) token(spacing.2)",
						lineHeight: 1,
						border: "1px solid token(colors.gray.300)",
						borderRadius: 14,
						margin: "token(spacing.1)",
						color: "gray.600",
						gap: "token(spacing.1)",
						alignItems: "center",
						justifyContent: "center",
						...(onClick
							? {
									cursor: "pointer",
									"&:hover": {
										background: "gray.100",
									},
								}
							: {}),
					})}
					onClick={() => {
						if (onClick) onClick(certification);
					}}
					onKeyUp={() => {
						if (onClick) onClick(certification);
					}}
					key={certification.id}
				>
					{!certification.isApproved && (
						<AlertCircle size={16} aria-label="未承認" />
					)}
					<span
						className={css({
							fontSize: 14,
							fontWeight: 500,
							textWrap: "nowrap",
						})}
					>
						{certification.title}
					</span>
					<span
						className={css({
							fontSize: 10,
							fontWeight: 400,
							lineHeight: "14px",
						})}
					>
						{certification.certifiedIn}
					</span>
				</span>
			))}
		</div>
	);
};
