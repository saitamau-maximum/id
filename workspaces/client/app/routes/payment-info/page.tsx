import { useEffect } from "react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { Table } from "~/components/ui/table";

import { useAuth } from "~/hooks/use-auth";

export default function PaymentInfo() {
	const { isLoading, isInitialized, isAuthorized, isProvisional } = useAuth();
	const navigate = useNavigate();

	// そのうち本登録ユーザーでも表示できるようにする？
	const shouldProceed =
		!isLoading && isAuthorized && isInitialized && isProvisional;

	useEffect(() => {
		if (!shouldProceed) navigate("/");
	}, [shouldProceed, navigate]);

	if (!shouldProceed) return null;

	return (
		<div
			className={css({
				width: "100%",
				height: "100%",
				maxWidth: 1024,
				margin: "auto",
				color: "gray.600",
				padding: 8,
				gap: 4,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
			})}
		>
			<h1
				className={css({
					fontSize: "2xl",
					fontWeight: "bold",
					color: "gray.700",
				})}
			>
				サークル費のお支払い
			</h1>
			<p>下記口座に入金をお願いします。 振込手数料はご負担ください。</p>
			<Table.Root>
				<Table.Tr>
					<Table.Th>銀行名</Table.Th>
					<Table.Td>青木信用金庫</Table.Td>
				</Table.Tr>
				<Table.Tr>
					<Table.Th>支店名</Table.Th>
					<Table.Td>埼大通支店</Table.Td>
				</Table.Tr>
				<Table.Tr>
					<Table.Th>預金種目</Table.Th>
					<Table.Td>普通</Table.Td>
				</Table.Tr>
				<Table.Tr>
					<Table.Th>口座番号</Table.Th>
					<Table.Td>3456237</Table.Td>
				</Table.Tr>
				<Table.Tr>
					<Table.Th>口座名義人</Table.Th>
					<Table.Td>マキシマム</Table.Td>
				</Table.Tr>
				<Table.Tr>
					<Table.Th>振込金額</Table.Th>
					<Table.Td>xx 円</Table.Td>
				</Table.Tr>
			</Table.Root>
			<p>口座名義人が正しいことを確認してから振り込んでください。</p>
			<p>
				振込依頼人はご自身の名前をフルネームで入力してください。
				<br />
				その他の名前で振り込まれた場合、受け付けられない場合があります。
			</p>
			<hr />
			<p>
				Admin が入金を確認でき次第、本登録完了とさせていただきます。
				<br />
				確認までに数日かかる場合がありますので、ご了承ください。
			</p>
			<p>
				本登録完了後は自動的にページが遷移します。
				<br />
				ページを閉じても再度アクセスすればまた表示されますのでご安心ください。
			</p>
		</div>
	);
}
