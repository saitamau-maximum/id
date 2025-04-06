import { useEffect } from "react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { Progress } from "~/components/ui/progess";
import { Table } from "~/components/ui/table";

import { useAuth } from "~/hooks/use-auth";
import { getFiscalYear } from "~/utils/date";

const Emphasize = ({ children }: { children: React.ReactNode }) => (
	<span
		className={css({
			fontWeight: "bold",
			color: "green.600",
		})}
	>
		{children}
	</span>
);

export default function PaymentInfo() {
	const { isLoading, isInitialized, isAuthorized, isProvisional, user } =
		useAuth();
	const navigate = useNavigate();

	// そのうち本登録ユーザーでも表示できるようにする？
	const shouldProceed =
		!isLoading && isAuthorized && isInitialized && isProvisional;

	useEffect(() => {
		if (!shouldProceed) navigate("/");
	}, [shouldProceed, navigate]);

	if (!shouldProceed || !user) return null;

	// isInitialized が true の時点で initializedAt は必ず存在するはず
	if (!user.initializedAt) throw new Error("initializedAt is null");

	// 今年度登録したユーザーは、 3 月までの残り月数から会費を計算する
	// そうでない場合、会費は 1 年分とする
	const remainingMonth =
		getFiscalYear(user.initializedAt) === getFiscalYear(new Date())
			? 12 - ((user.initializedAt.getMonth() - 3 + 12) % 12)
			: 12;
	// 4 月登録: 12 - (3 - 3 + 12) % 12 = 12
	// 5 月登録: 12 - (4 - 3 + 12) % 12 = 11
	// ...
	// 2 月登録: 12 - (1 - 3 + 12) % 12 = 2
	// 3 月登録: 12 - (2 - 3 + 12) % 12 = 1

	const registrationSteps = [
		{ label: "仮登録", isActive: true, isCompleted: true },
		{ label: "入金", isActive: true, isCompleted: false },
		{ label: "承認", isActive: false, isCompleted: false },
		{ label: "完了", isActive: false, isCompleted: false },
	];

	return (
		<div
			className={css({
				width: "100%",
				height: "100%",
				overflowY: "auto",
			})}
		>
			<div
				className={css({
					width: "100%",
					maxWidth: 1024,
					minHeight: "100%",
					margin: "auto",
					padding: 8,
					color: "gray.600",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				})}
			>
				<Progress steps={registrationSteps} />
				<h1
					className={css({
						fontSize: "2xl",
						fontWeight: "bold",
						color: "gray.700",
						marginTop: 8,
						marginBottom: 4,
					})}
				>
					サークル費のお支払い
				</h1>
				<Table.Root>
					<Table.Tr>
						<Table.Th className={css({ width: "120px" })}>銀行名</Table.Th>
						<Table.Td>青木信用金庫</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Th className={css({ width: "120px" })}>支店名</Table.Th>
						<Table.Td>埼大通支店</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Th className={css({ width: "120px" })}>預金種目</Table.Th>
						<Table.Td>普通</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Th className={css({ width: "120px" })}>口座番号</Table.Th>
						<Table.Td>3456237</Table.Td>
					</Table.Tr>
				</Table.Root>
				<p className={css({ marginTop: 4 })}>
					口座名義人が <Emphasize>マキシマム</Emphasize> であることを確認し、{" "}
					<Emphasize>{(remainingMonth * 250).toLocaleString()} 円</Emphasize>{" "}
					をお振込みください。 振込手数料はご負担願います。
				</p>
				<p className={css({ marginTop: 4 })}>
					Admin が <Emphasize>入金を確認でき次第、本登録完了</Emphasize>{" "}
					とさせていただきます。
					確認までに数日かかる場合がありますので、ご了承ください。
				</p>
				{/* <p className={css({ marginTop: 2 })}>
					なお、対面の活動に参加し、会計担当にお支払いいただくことも可能です。
				</p> */}
				<p
					className={css({
						fontSize: "sm",
						marginTop: 4,
					})}
				>
					ページを閉じても、再度アクセスすればまた表示されます。
					ご安心ください。
				</p>
			</div>
		</div>
	);
}
