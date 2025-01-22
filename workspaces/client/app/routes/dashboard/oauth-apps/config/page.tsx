import { ChevronLeft } from "react-feather";
import { Link, useParams } from "react-router";
import { AnchorLike } from "~/components/ui/anchor-like";

export default function Config() {
	const { oauthAppId } = useParams<{ oauthAppId: string }>();

	return (
		<div>
			OAuth アプリケーション <code>{oauthAppId}</code> の設定
			<Link to="/oauth-apps">
				<AnchorLike>
					<ChevronLeft /> 戻る
				</AnchorLike>
			</Link>
		</div>
	);
}
