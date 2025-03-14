import { css } from "styled-system/css";
import { UserDisplay } from "~/components/feature/user/user-display";
import { Table } from "~/components/ui/table";
import type { Certification } from "~/types/certification";
import { useCertificationRequests } from "../hooks/use-certification-requests";

interface Props {
	certifications: Certification[];
}

export const CertificationRequestList = ({ certifications }: Props) => {
	const { data: certificationRequests } = useCertificationRequests();

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
			<Table.Root>
				<thead>
					<Table.Tr>
						<Table.Th>申請者</Table.Th>
						<Table.Th>資格・試験</Table.Th>
						<Table.Th>取得年</Table.Th>
						<Table.Th>承認 / 却下</Table.Th>
					</Table.Tr>
				</thead>
				<tbody>
					{certificationRequests?.map((certificationRequest) => {
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
								<Table.Td>
									{
										certifications.find(
											(cert) =>
												cert.id === certificationRequest.certificationId,
										)?.title
									}
								</Table.Td>
								<Table.Td>{certificationRequest.certifiedIn}</Table.Td>
							</Table.Tr>
						);
					})}
				</tbody>
			</Table.Root>
		</div>
	);
};
