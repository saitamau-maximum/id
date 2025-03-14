import { Trash } from "react-feather";
import { css } from "styled-system/css";
import { Table } from "~/components/ui/table";
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
			<Table.Root>
				<thead>
					<Table.Tr>
						<Table.Th>資格・試験</Table.Th>
						<Table.Th>説明</Table.Th>
						<Table.Th>削除</Table.Th>
					</Table.Tr>
				</thead>
				<tbody>
					{certifications?.map((certification) => {
						return (
							<Table.Tr key={certification.id}>
								<Table.Td>{certification.title}</Table.Td>
								<Table.Td>{certification.description}</Table.Td>
								<Table.Td>
									{/* 機能はあとでやる */}
									<button
										type="button"
										className={css({
											cursor: "pointer",
											"&:hover": {
												color: "rose.600",
											},
										})}
									>
										<Trash size={20} />
									</button>
								</Table.Td>
							</Table.Tr>
						);
					})}
				</tbody>
			</Table.Root>
		</div>
	);
};
