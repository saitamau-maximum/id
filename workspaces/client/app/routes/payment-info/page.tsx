import { useEffect } from "react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { MemberCard } from "~/components/feature/user/member-card";
import { AnchorLike } from "~/components/ui/anchor-like";
import { Details } from "~/components/ui/details";
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

	const membershipPrice = remainingMonth * 250;

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
					margin: "auto",
					padding: 8,
					color: "gray.600",
					marginTop: 128,
					mdDown: {
						padding: 4,
						marginTop: 0,
					},
				})}
			>
				<div
					className={css({
						marginTop: 4,
						marginBottom: 4,
					})}
				>
					<Progress steps={registrationSteps} />
				</div>

				<div
					className={css({
						marginTop: 8,
						marginBottom: 8,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					})}
				>
					<MemberCard
						id={user.id}
						displayId={user.displayId || ""}
						displayName={user.displayName || ""}
						profileImageURL={user.profileImageURL}
						grade={user.grade}
						realName={user.realName || ""}
						roles={user.roles}
						initialized={!!user.initializedAt}
						displayOnly
					/>
				</div>

				<h1
					className={css({
						fontSize: "2xl",
						fontWeight: "bold",
						color: "gray.700",
						marginTop: 4,
					})}
				>
					サークル費のお支払い
				</h1>
				<p className={css({ marginTop: 2 })}>
					サークル費は <Emphasize>{`${membershipPrice} 円`}</Emphasize>{" "}
					です。下記の方法でお支払いください。
				</p>
				<div
					className={css({
						marginTop: 4,
						marginBottom: 4,
						display: "flex",
						flexDirection: "column",
						gap: 2,
					})}
				>
					<Details summary="方法1: 対面での支払い">
						<p>
							対面の活動に参加し、運営メンバーに{" "}
							<Emphasize>この画面を見せて</Emphasize> 現金でお支払いください。
							運営メンバーは、サークルの活動に参加しているメンバーであれば誰でも構いません。
						</p>
					</Details>
					<Details summary="方法2: 銀行振込での支払い">
						<p className={css({ marginTop: 2 })}>
							口座名義人が <Emphasize>マキシマム</Emphasize>{" "}
							であることを確認して以下の口座へお振込みください。
							<br />
							振込手数料はご負担願います。
						</p>
						<p className={css({ marginTop: 2, marginBottom: 4 })}>
							<Emphasize>入金を確認でき次第、本登録完了</Emphasize>{" "}
							とさせていただきます。
						</p>
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
								<Table.Th className={css({ width: "120px" })}>
									預金種目
								</Table.Th>
								<Table.Td>普通</Table.Td>
							</Table.Tr>
							<Table.Tr>
								<Table.Th className={css({ width: "120px" })}>
									口座番号
								</Table.Th>
								<Table.Td>3456237</Table.Td>
							</Table.Tr>
						</Table.Root>
						<p
							className={css({
								fontSize: "sm",
								marginTop: 4,
								color: "gray.500",
							})}
						>
							※入金は確認までに数日かかる場合がありますので、ご了承ください。
						</p>
					</Details>
				</div>
				<p
					className={css({
						fontSize: "sm",
						marginTop: 4,
						color: "gray.500",
					})}
				>
					ページを閉じても、再度アクセス(Githubでログイン)すればまた表示されますので、ご安心ください。
					<br />
					その他、不明点があれば、気軽に
					<a href="https://x.com/Maximum03400346">
						<AnchorLike>公式X</AnchorLike>
					</a>
					やメンバーへお尋ねください。
				</p>
			</div>
		</div>
	);
}
