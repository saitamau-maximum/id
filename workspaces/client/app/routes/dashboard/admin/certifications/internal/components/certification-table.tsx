import { useCallback, useEffect, useState } from "react";
import { Check, Edit, Trash } from "react-feather";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { Form } from "~/components/ui/form";
import { Table } from "~/components/ui/table";
import type { Certification } from "~/types/certification";
import {
	useDeleteCertification,
	useUpdateCertification,
} from "../hooks/use-certification-mutations";

interface Props {
	certifications: Certification[];
}

export const CertificationTable = ({ certifications }: Props) => {
	const { mutate: deleteCertification, isPending: isPendingDeletion } =
		useDeleteCertification();
	const { mutate: updateCertification, isPending: isPendingUpdate } =
		useUpdateCertification();
	const [editing, setEditing] = useState(
		new Array(certifications.length).fill(false),
	);

	useEffect(() => {
		setEditing(new Array(certifications.length).fill(false));
	}, [certifications.length]);

	const { getValues, register } = useForm({
		defaultValues: {
			description: certifications.map((cert) => cert.description),
		},
	});

	const handleDeleteCertification = useCallback(
		async (certification: Certification) => {
			const res = await ConfirmDialog.call({
				title: "資格・試験の削除",
				children: <DeleteConfirmation title={certification.title} />,
				danger: true,
			});
			if (res.type === "dismiss") return;
			deleteCertification(certification.id);
		},
		[deleteCertification],
	);

	const handleUpdateCertification = useCallback(
		async (certification: Certification, idx: number) => {
			const description = getValues(`description.${idx}` as const);
			updateCertification(
				{ certificationId: certification.id, description },
				{
					onSuccess: () => {
						// index === idx なら false にして、そうでなければ val のまま
						setEditing((arr) => arr.map((val, index) => index !== idx && val));
					},
				},
			);
		},
		[updateCertification, getValues],
	);

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
				<Table.Root>
					<thead>
						<Table.Tr>
							<Table.Th>資格・試験</Table.Th>
							<Table.Th>説明</Table.Th>
							<Table.Th>操作</Table.Th>
						</Table.Tr>
					</thead>
					<tbody>
						{certifications?.map((certification, idx) => (
							<Table.Tr key={certification.id}>
								<Table.Td>{certification.title}</Table.Td>
								<Table.Td>
									{editing[idx] ? (
										<div
											className={css({
												display: "flex",
												gap: 2,
												alignItems: "center",
											})}
										>
											<Form.Input
												defaultValue={certification.description ?? ""}
												{...register(`description.${idx}` as const)}
											/>
											<button
												type="button"
												disabled={isPendingUpdate}
												onClick={() => {
													handleUpdateCertification(certification, idx);
												}}
												className={css({
													cursor: "pointer",
													"&:hover": {
														color: "green.600",
													},
												})}
											>
												<Check size={20} />
											</button>
										</div>
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
											color: editing[idx] ? "gray.300" : "inherit",
										})}
									>
										<button
											type="button"
											disabled={isPendingDeletion || editing[idx]}
											className={css({
												cursor: editing[idx] ? "not-allowed" : "pointer",
												color: editing[idx] ? "gray.300" : "inherit",
												"&:hover": {
													color: editing[idx] ? "gray.300" : "green.600",
												},
											})}
											onClick={() => {
												setEditing((arr) =>
													// index === idx なら true にして、それ以外ならそのまま
													arr.map((val, index) => val || index === idx),
												);
											}}
										>
											<Edit size={20} />
										</button>
										/
										<button
											type="button"
											disabled={isPendingDeletion || editing[idx]}
											className={css({
												cursor: editing[idx] ? "not-allowed" : "pointer",
												color: editing[idx] ? "gray.300" : "inherit",
												"&:hover": {
													color: editing[idx] ? "gray.300" : "rose.600",
												},
											})}
											onClick={() => {
												handleDeleteCertification(certification);
											}}
										>
											<Trash size={20} />
										</button>
									</div>
								</Table.Td>
							</Table.Tr>
						))}
					</tbody>
				</Table.Root>
			)}
		</div>
	);
};
