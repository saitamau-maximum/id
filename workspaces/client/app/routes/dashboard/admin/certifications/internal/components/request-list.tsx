import { useCallback } from "react";
import { Check, X } from "react-feather";
import { css } from "styled-system/css";
import { UserDisplay } from "~/components/feature/user/user-display";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import type { CertificationRequestWithUser } from "~/repository/certification";
import { useCertificationRequests } from "../../../internal/hooks/use-certification-requests";
import { useCertifications } from "../hooks/use-certifications";
import { useReviewRequest } from "../hooks/use-review-request";

export const CertificationRequestList = () => {
	const { data: certifications } = useCertifications();
	const { data: certificationRequests, isFetching } =
		useCertificationRequests();

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
				資格・試験のリクエスト一覧
			</h2>
			{certificationRequests.length === 0 ? (
				<p
					className={css({
						color: "gray.500",
						textAlign: "center",
					})}
				>
					リクエストはありません
				</p>
			) : (
				<Table.Root loading={isFetching}>
					<thead>
						<Table.Tr>
							<Table.Th>申請者</Table.Th>
							<Table.Th>資格・試験</Table.Th>
							<Table.Th>取得年</Table.Th>
							<Table.Th>承認 / 却下</Table.Th>
						</Table.Tr>
					</thead>
					<tbody>
						{certificationRequests.map((certificationRequest) => {
							return (
								<CertificationRequestRow
									key={`${certificationRequest.user.displayId}:${certificationRequest.certificationId}`}
									certificationTitle={
										certifications.find(
											(certification) =>
												certification.id ===
												certificationRequest.certificationId,
										)?.title ?? ""
									}
									certificationRequest={certificationRequest}
								/>
							);
						})}
					</tbody>
				</Table.Root>
			)}
		</div>
	);
};

const CertificationRequestRow = ({
	certificationTitle,
	certificationRequest,
}: {
	certificationTitle: string;
	certificationRequest: CertificationRequestWithUser;
}) => {
	const { mutate, isPending } = useReviewRequest();

	const handleApproveRequest = useCallback(() => {
		mutate({
			userId: certificationRequest.user.id,
			certificationId: certificationRequest.certificationId,
			isApproved: true,
		});
	}, [mutate, certificationRequest]);

	const handleRejectRequest = useCallback(
		() =>
			mutate({
				userId: certificationRequest.user.id,
				certificationId: certificationRequest.certificationId,
				isApproved: false,
			}),
		[mutate, certificationRequest],
	);

	return (
		<Table.Tr
			key={`${certificationRequest.user.displayId}:${certificationRequest.certificationId}`}
		>
			<Table.Td>
				<UserDisplay
					displayId={certificationRequest.user.displayId ?? ""}
					name={certificationRequest.user.displayName ?? ""}
					iconURL={certificationRequest.user.profileImageURL ?? ""}
				/>
			</Table.Td>
			<Table.Td>{certificationTitle}</Table.Td>
			<Table.Td>{certificationRequest.certifiedIn}</Table.Td>
			<Table.Td>
				<div
					className={css({
						display: "flex",
						gap: 2,
						alignItems: "center",
						justifyContent: "center",
						userSelect: "none",
					})}
				>
					<IconButton
						type="button"
						label="承認"
						onClick={() => handleApproveRequest()}
						color="apply"
						disabled={isPending}
					>
						<Check size={20} />
					</IconButton>
					/
					<IconButton
						type="button"
						label="却下"
						onClick={() => handleRejectRequest()}
						disabled={isPending}
						color="danger"
					>
						<X size={20} />
					</IconButton>
				</div>
			</Table.Td>
		</Table.Tr>
	);
};
