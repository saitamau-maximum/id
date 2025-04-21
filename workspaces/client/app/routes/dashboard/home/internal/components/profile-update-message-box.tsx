import { ArrowUpRight } from "react-feather";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { MessageBox } from "~/components/ui/message-box";

export const ProfileUpdateMessageBox = () => {
	const navigate = useNavigate();

	return (
		<MessageBox
			variant="info"
			right={<ArrowUpRight size={24} />}
			onClick={() => navigate("/settings")}
		>
			新年度になりました、学年と学籍番号を更新してください。
			<br />
			<span className={css({ fontSize: "xs" })}>
				※変更がない方でもプロフィール画面から更新ボタンを押すことでこのメッセージは消えます。
			</span>
		</MessageBox>
	);
};
