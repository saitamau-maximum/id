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
			onClick={() => navigate("/payment-info")}
		>
			今年度の会費をまだお支払いされていません。
			<br />
			<span className={css({ fontSize: "xs" })}>
				※お支払い後、プロフィール画面から更新ボタンを押すことでこのメッセージは消えます。
			</span>
		</MessageBox>
	);
};
