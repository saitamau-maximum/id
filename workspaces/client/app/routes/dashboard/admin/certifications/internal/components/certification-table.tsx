import { useActionState, useCallback, useState } from "react";
import { Check, Edit, Trash } from "react-feather";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { Form } from "~/components/ui/form";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import type { CertificationUpdateParams } from "~/repository/certification";
import type { Certification } from "~/types/certification";
import { useCertifications } from "../hooks/use-certifications";
import { useDeleteCertification } from "../hooks/use-delete-certification";
import { useUpdateCertification } from "../hooks/use-update-certification";

export const CertificationTable = () => {
	const { data: certifications, isFetching } = useCertifications();

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
					資格・試験はありません
				</p>
			) : (
				<Table.Root loading={isFetching}>
					<thead>
						<Table.Tr>
							<Table.Th>資格・試験</Table.Th>
							<Table.Th>説明</Table.Th>
							<Table.Th>操作</Table.Th>
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
	const { mutate: deleteCertification, isPending: isPendingDeletion } =
		useDeleteCertification();
	const { mutate: updateCertification, isPending: isPendingUpdate } =
		useUpdateCertification();
	const [editing, setEditing] = useState(false);

	const handleDeleteCertification = useCallback(async () => {
		const res = await ConfirmDialog.call({
			title: "資格・試験の削除",
			children: <DeleteConfirmation title={certification.title} />,
			danger: true,
		});
		if (res.type === "dismiss") return;
		deleteCertification(certification.id);
	}, [deleteCertification, certification]);

	const [_, updateCertificationAction] = useActionState(
		async (_: null, formData: FormData) => {
			const description = formData.get("description");
			if (typeof description !== "string") return null;

			const param: CertificationUpdateParams = {
				certificationId: certification.id,
				description,
			};

			updateCertification(param);
			setEditing(false);
			return null;
		},
		null,
	);

	return (
		<Table.Tr key={certification.id}>
			<Table.Td>{certification.title}</Table.Td>
			<Table.Td>
				{editing ? (
					<form
						action={updateCertificationAction}
						className={css({ display: "flex", gap: 2, alignItems: "center" })}
					>
						<Form.Input
							name="description"
							defaultValue={certification.description ?? ""}
						/>
						<IconButton
							type="submit"
							label="更新"
							color="apply"
							disabled={isPendingUpdate}
						>
							<Check size={20} />
						</IconButton>
					</form>
				) : (
					certification.description
				)}
			</Table.Td>
			<Table.Td>
				<div
					className={css({
						display: "flex",
						gap: 4,
						alignItems: "center",
						justifyContent: "center",
						userSelect: editing ? "none" : "auto",
					})}
				>
					<IconButton
						type="button"
						label="編集"
						color="text"
						disabled={isPendingDeletion || editing}
						onClick={() => {
							setEditing(true);
						}}
					>
						<Edit size={16} />
					</IconButton>
					/
					<IconButton
						type="button"
						label="削除"
						color="danger"
						disabled={isPendingDeletion || editing}
						onClick={handleDeleteCertification}
					>
						<Trash size={16} />
					</IconButton>
				</div>
			</Table.Td>
		</Table.Tr>
	);
};
