import { ArrowUpRight } from "react-feather";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { MessageBox } from "~/components/ui/message-box";

export const PaymentMessageBox = () => {
	const navigate = useNavigate();

	return (
		<MessageBox
			variant="warning"
			right={<ArrowUpRight size={24} />}
			onClick={() => navigate("/update-payment-info")}
		>
			今年度の会費をまだお支払いされていません。
			<br />
			<span className={css({ fontSize: "xs" })}>
				※支払いを会計が確認次第、このメッセージは消えます
				<br />
				月末までにお支払いが確認できなかった場合、アカウントが凍結されますのでご注意ください。
			</span>
		</MessageBox>
	);
};
