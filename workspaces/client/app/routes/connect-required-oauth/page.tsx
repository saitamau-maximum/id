import {
	OAUTH_PROVIDERS,
	REQUIRED_OAUTH_PROVIDER_IDS,
} from "@idp/server/shared/oauth";
import { useEffect } from "react";
import { type MetaFunction, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { OAuthServiceProviderBadge } from "~/components/feature/oauth-internal/service-provider-badge";
import { OAuthUserBadge } from "~/components/feature/oauth-internal/user-badge";
import { AnchorLike } from "~/components/ui/anchor-like";
import { Details } from "~/components/ui/details";
import { Table } from "~/components/ui/table";
import { useAuth } from "~/hooks/use-auth";
import { env } from "~/utils/env";

export const meta: MetaFunction = () => {
	return [{ title: "必須 OAuth の連携 | Maximum IdP" }];
};

export default function ConnectRequiredOAuth() {
	const {
		isLoading,
		isAuthorized,
		isInitialized,
		isProvisional,
		user,
		lacksRequiredOAuthConnections,
	} = useAuth();
	const navigate = useNavigate();

	const loginSearchParams = new URLSearchParams();
	const continueToURL = window.location.href;
	loginSearchParams.set("continue_to", continueToURL);
	loginSearchParams.set("from", "settings");

	const shouldProceed =
		!isLoading &&
		isAuthorized &&
		isInitialized &&
		!isProvisional &&
		lacksRequiredOAuthConnections;

	useEffect(() => {
		if (!shouldProceed) navigate("/");
	}, [shouldProceed, navigate]);

	if (!shouldProceed || !user) return null;

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
					marginTop: 16,
					mdDown: {
						padding: 4,
					},
				})}
			>
				<h1
					className={css({
						fontSize: "3xl",
						fontWeight: "bold",
						color: "gray.600",
					})}
				>
					必須 OAuth の連携
				</h1>
				<span className={css({ color: "gray.500", fontSize: "md" })}>
					Maximum IdP を利用するには、以下のサービスとの連携が必要です。
				</span>
				<div className={css({ marginTop: 4, marginBottom: 4 })}>
					<Table.Root>
						<Table.Tr>
							<Table.Th>サービス</Table.Th>
							<Table.Th>連携状況</Table.Th>
						</Table.Tr>
						{REQUIRED_OAUTH_PROVIDER_IDS.map((providerId) => {
							const conn = user.oauthConnections.find(
								(conn) => conn.providerId === providerId,
							);
							return (
								<Table.Tr key={providerId}>
									<Table.Td>
										<OAuthServiceProviderBadge providerId={providerId} />
									</Table.Td>
									<Table.Td>
										{conn ? (
											<>
												<OAuthUserBadge conn={conn} /> として連携済みです
											</>
										) : (
											<>
												未連携です。
												<a
													href={`${env("SERVER_HOST")}${OAUTH_PROVIDERS[providerId].loginPath}?${loginSearchParams.toString()}`}
												>
													<AnchorLike>連携する</AnchorLike>
												</a>
											</>
										)}
									</Table.Td>
								</Table.Tr>
							);
						})}
					</Table.Root>
				</div>
				<Details summary="なぜ連携が必要なの？">
					これらのサービスが提供する機能やデータが、 Maximum
					での活動に不可欠であるためです。
					これらのサービスとの連携があることにより、 Maximum
					ではメンバーの一元管理や、活動の可視化、コミュニケーションの円滑化などが実現されています。
					また、これらのアカウントによる Maximum
					サービスへのログインも可能になります。
					「いつの間にか勝手に投稿されてた！」のようなことはないので安心してください。
				</Details>
			</div>
		</div>
	);
}
