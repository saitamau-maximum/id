import { useActionState, useCallback, useState } from "react";
import { Check, Edit, Trash } from "react-feather";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { Form } from "~/components/ui/form";
import { Table } from "~/components/ui/table";
import type { CertificationUpdateParams } from "~/repository/certification";
import type { Certification } from "~/types/certification";
import {
	useDeleteCertification,
	useUpdateCertification,
} from "../hooks/use-certification-mutations";

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

			const param: CertificationUpdateParams = {
				certificationId: certification.id,
			};
			if (typeof description === "string") param.description = description;

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
						<button
							type="submit"
							disabled={isPendingUpdate}
							className={css({
								cursor: "pointer",
								"&:hover": {
									color: "green.600",
								},
							})}
						>
							<Check size={20} />
						</button>
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
						color: editing ? "gray.300" : "inherit",
					})}
				>
					<button
						type="button"
						disabled={isPendingDeletion || editing}
						className={css({
							cursor: editing ? "not-allowed" : "pointer",
							color: editing ? "gray.300" : "inherit",
							"&:hover": {
								color: editing ? "gray.300" : "green.600",
							},
						})}
						onClick={() => {
							setEditing(true);
						}}
					>
						<Edit size={20} />
					</button>
					/
					<button
						type="button"
						disabled={isPendingDeletion || editing}
						className={css({
							cursor: editing ? "not-allowed" : "pointer",
							color: editing ? "gray.300" : "inherit",
							"&:hover": {
								color: editing ? "gray.300" : "rose.600",
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
