import { useCallback } from "react";
import { Trash } from "react-feather";
import { css } from "styled-system/css";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { Table } from "~/components/ui/table";
import type { Certification } from "~/types/certification";
import { useDeleteCertification } from "../hooks/use-delete-certification";
import { DeleteConfirmation } from "./delete-confirmation";

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
			{certifications.length === 0 ? (
				<p
					className={css({
						color: "gray.500",
						textAlign: "center",
					})}
				>
					リクエストはありません
				</p>
			) : (
				<Table.Root>
					<thead>
						<Table.Tr>
							<Table.Th>資格・試験</Table.Th>
							<Table.Th>説明</Table.Th>
							<Table.Th>編集 / 削除</Table.Th>
						</Table.Tr>
					</thead>
					<tbody>
						{certifications?.map((certification) => (
							<CertificationTableRow
								certification={certification}
								key={certification.id}
							/>
						))}
					</tbody>
				</Table.Root>
			)}
		</div>
	);
};

interface TableRowProps {
	certification: Certification;
}
const CertificationTableRow = ({ certification }: TableRowProps) => {
	const { mutate, isPending } = useDeleteCertification();

	const handleDeleteCertification = useCallback(async () => {
		const res = await ConfirmDialog.call({
			title: "資格・試験の削除",
			children: <DeleteConfirmation title={certification.title} />,
			danger: true,
		});
		if (res.type === "dismiss") return;
		mutate(certification.id);
	}, [mutate, certification]);

	return (
		<Table.Tr key={certification.id}>
			<Table.Td>{certification.title}</Table.Td>
			<Table.Td>{certification.description}</Table.Td>
			<Table.Td>
				<div
					className={css({
						display: "flex",
						gap: 4,
						alignItems: "center",
						justifyContent: "center",
					})}
				>
					<button
						type="button"
						disabled={isPending}
						className={css({
							cursor: "pointer",
							"&:hover": {
								color: "rose.600",
							},
						})}
						onClick={handleDeleteCertification}
					>
						<Trash size={20} />
					</button>
				</div>
			</Table.Td>
		</Table.Tr>
	);
};
