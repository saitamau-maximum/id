import { css } from "styled-system/css";
import { PaymentInfoDisplay } from "~/components/feature/payment/info-display";
import { MemberCard } from "~/components/feature/user/member-card";
import { Progress } from "~/components/ui/progess";

import { useAuth } from "~/hooks/use-auth";

const PAYMENT_UPDATE_STEPS = [
	{ label: "入金", isActive: true, isCompleted: false },
	{ label: "承認", isActive: false, isCompleted: false },
	{ label: "完了", isActive: false, isCompleted: false },
];

export default function UpdatePaymentInfo() {
	const { user } = useAuth();

	if (!user || !user.initializedAt) return null;

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
					<Progress steps={PAYMENT_UPDATE_STEPS} />
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
			</div>
		</div>
	);
}
