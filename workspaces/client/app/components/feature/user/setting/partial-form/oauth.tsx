import type { ExportableOAuthConnection } from "@idp/schema/entity/oauth-internal/oauth-connection";
import {
	OAUTH_PROVIDER_IDS,
	OAUTH_PROVIDERS,
	type OAuthProviderId,
} from "@idp/schema/entity/oauth-internal/oauth-provider";
import { useCallback } from "react";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { OAuthServiceProviderBadge } from "~/components/feature/oauth-internal/service-provider-badge";
import { OAuthUserBadge } from "~/components/feature/oauth-internal/user-badge";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { AnchorLike } from "~/components/ui/anchor-like";
import { Details } from "~/components/ui/details";
import { Table } from "~/components/ui/table";
import { useAuth } from "~/hooks/use-auth";
import { env } from "~/utils/env";
import { useDeleteOAuthConnection } from "../hooks/use-delete-oauth-connection";

const OAuthConnRow = ({
	providerId,
	conns,
}: {
	providerId: OAuthProviderId;
	conns: ExportableOAuthConnection[];
}) => {
	const conn = conns.find((conn) => conn.providerId === providerId);

	const loginSearchParams = new URLSearchParams();
	const continueToURL = window.location.href;
	loginSearchParams.set("continue_to", continueToURL);
	loginSearchParams.set("from", "settings");

	const { mutate } = useDeleteOAuthConnection();

	const handleDelete = useCallback(async () => {
		if (conn) {
			const res = await ConfirmDialog.call({
				title: `${OAUTH_PROVIDERS[providerId].name} OAuth 連携の解除`,
				children: <DeleteConfirmation />,
				danger: true,
			});
			if (res.type === "dismiss") return;
			mutate(providerId);
		}
	}, [conn, providerId, mutate]);

	return (
		<Table.Tr>
			<Table.Td>
				<OAuthServiceProviderBadge providerId={providerId} />
			</Table.Td>
			<Table.Td>{conn && <OAuthUserBadge conn={conn} />}</Table.Td>
			<Table.Td>
				<a
					href={`${env("SERVER_HOST")}${OAUTH_PROVIDERS[providerId].loginPath}?${loginSearchParams.toString()}`}
				>
					<AnchorLike>{conn && "再"}連携する</AnchorLike>
				</a>
			</Table.Td>
			<Table.Td>
				{OAUTH_PROVIDERS[providerId].required && conn && (
					<span>連携解除できません</span>
				)}
				{!OAUTH_PROVIDERS[providerId].required && conn && (
					<button
						onClick={handleDelete}
						type="button"
						className={css({ cursor: "pointer" })}
					>
						<AnchorLike>連携を解除する</AnchorLike>
					</button>
				)}
			</Table.Td>
		</Table.Tr>
	);
};

export const UserSettingFormOAuth = () => {
	const { user, isLoading } = useAuth();

	return (
		<>
			<p
				className={css({ color: "gray.600", textAlign: "left", width: "100%" })}
			>
				外部サービスのアカウントと連携することで、 OAuth
				を使ったログインが可能になります。 また、 IdP
				の情報をもとに、連携先のサービスを便利に利用できるようになります。
			</p>

			<Table.Root loading={isLoading}>
				<Table.Tr>
					<Table.Th>サービス</Table.Th>
					<Table.Th>アカウント</Table.Th>
					<Table.Th>連携</Table.Th>
					<Table.Th>連携解除</Table.Th>
				</Table.Tr>
				{Object.values(OAUTH_PROVIDER_IDS).map((providerId) => (
					<OAuthConnRow
						key={providerId}
						providerId={providerId}
						conns={user?.oauthConnections ?? []}
					/>
				))}
			</Table.Root>

			<Details summary="なぜ連携解除できないサービスがあるの？">
				これらのサービスが提供する機能やデータが、 Maximum
				での活動に不可欠であるためです。
				これらのサービスとの連携があることにより、 Maximum
				ではメンバーの一元管理や、活動の可視化、コミュニケーションの円滑化などが実現されています。
				また、これらのアカウントによる Maximum
				サービスへのログインも可能になります。
				「いつの間にか勝手に投稿されてた！」のようなことはないので安心してください。
			</Details>
		</>
	);
};
