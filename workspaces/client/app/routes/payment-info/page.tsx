import { useEffect } from "react";
import { type MetaFunction, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { PaymentInfoDisplay } from "~/components/feature/payment/info-display";
import { MemberCard } from "~/components/feature/user/member-card";
import { Progress } from "~/components/ui/progess";

import { useAuth } from "~/hooks/use-auth";

const REGISTRATION_STEPS = [
	{ label: "仮登録", isActive: true, isCompleted: true },
	{ label: "入金", isActive: true, isCompleted: false },
	{ label: "承認", isActive: false, isCompleted: false },
	{ label: "完了", isActive: false, isCompleted: false },
];

export const meta: MetaFunction = () => {
	return [{ title: "Login - Maximum IdP" }];
};

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
					<Progress steps={REGISTRATION_STEPS} />
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

				<PaymentInfoDisplay />

				<p
					className={css({
						fontSize: "sm",
						marginTop: 4,
						color: "gray.500",
					})}
				>
					ページを閉じても、再度アクセス(GitHubでログイン)すればまた表示されますので、ご安心ください。
					<br />
					その他、不明点があれば、気軽に新歓用 Discord
					サーバーやメンバーへお尋ねください。
				</p>
			</div>
		</div>
	);
}
