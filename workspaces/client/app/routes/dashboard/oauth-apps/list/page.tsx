import { Table } from "~/components/ui/table";

export default function List() {
	return (
		<div>
			これまでに作成された OAuth アプリケーション一覧
			<Table.Root>
				<Table.Tr>
					<Table.Th>アプリケーション名</Table.Th>
					<Table.Th>説明</Table.Th>
					<Table.Th>作成者</Table.Th>
					<Table.Th>管理者</Table.Th>
				</Table.Tr>
				<Table.Tr>
					<Table.Td>[Logo] Maximum Private Website</Table.Td>
					<Table.Td>ほげほげ</Table.Td>
					<Table.Td>[Avatar] a01sa01to</Table.Td>
					<Table.Td>[Avatar] a01sa01to, [Avatar] sor4chi</Table.Td>
				</Table.Tr>
			</table>
		</div>
	);
}
