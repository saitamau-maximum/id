import type { ExportableOAuthConnection } from "@idp/schema/entity/oauth-internal/oauth-connection";
import {
	OAUTH_PROVIDER_IDS,
	OAUTH_PROVIDERS,
	type OAuthProviderId,
} from "@idp/schema/entity/oauth-internal/oauth-provider";
import { useCallback } from "react";
import { css } from "styled-system/css";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { AnchorLike } from "~/components/ui/anchor-like";
import { Form } from "~/components/ui/form";
import { Table } from "~/components/ui/table";
import { useAuth } from "~/hooks/use-auth";
import { env } from "~/utils/env";
import { DeleteConfirmation } from "../../delete-confirmation";
import { OAuthServiceProviderBadge } from "../../oauth-internal/service-provider-badge";
import { OAuthUserBadge } from "../../oauth-internal/user-badge";
import { useDeleteOAuthConnection } from "./hooks/use-delete-oauth-connection";

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
				{OAUTH_PROVIDERS[providerId].required && (
					<span>連携の解除はできません</span>
				)}
				{!OAUTH_PROVIDERS[providerId].required && !conn && (
					<a
						href={`${env("SERVER_HOST")}${OAUTH_PROVIDERS[providerId].loginPath}?${loginSearchParams.toString()}`}
					>
						<AnchorLike>連携する</AnchorLike>
					</a>
				)}
				{!OAUTH_PROVIDERS[providerId].required && conn && (
					<>
						<a
							href={`${env("SERVER_HOST")}${OAUTH_PROVIDERS[providerId].loginPath}?${loginSearchParams.toString()}`}
						>
							<AnchorLike>再連携する</AnchorLike>
						</a>
						{" / "}
						<button
							onClick={handleDelete}
							type="button"
							className={css({ cursor: "pointer" })}
						>
							<AnchorLike>連携を解除する</AnchorLike>
						</button>
					</>
				)}
			</Table.Td>
		</Table.Tr>
	);
};

export const UserSettingOAuthConnect = () => {
	const { user } = useAuth();

	return (
		<Form.FieldSet>
			<legend>
				<Form.LabelText>OAuth を使ったログイン</Form.LabelText>
			</legend>

			<Table.Root>
				<Table.Tr>
					<Table.Th>サービス</Table.Th>
					<Table.Th>アカウント</Table.Th>
					<Table.Th>連携</Table.Th>
				</Table.Tr>
				{Object.values(OAUTH_PROVIDER_IDS).map((providerId) => (
					<OAuthConnRow
						key={providerId}
						providerId={providerId}
						conns={user?.oauthConnections ?? []}
					/>
				))}
			</Table.Root>
		</Form.FieldSet>
	);
};
