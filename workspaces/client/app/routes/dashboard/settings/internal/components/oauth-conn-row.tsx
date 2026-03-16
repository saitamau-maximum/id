import {
	OAUTH_PROVIDERS,
	type OAuthProviderId,
} from "@idp/server/shared/oauth";
import { useCallback } from "react";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { OAuthServiceProviderBadge } from "~/components/feature/oauth-internal/service-provider-badge";
import { OAuthUserBadge } from "~/components/feature/oauth-internal/user-badge";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { AnchorLike } from "~/components/ui/anchor-like";
import { Table } from "~/components/ui/table";
import type { OAuthConnection } from "~/types/oauth-internal";
import { env } from "~/utils/env";
import { useDeleteOAuthConnection } from "../hooks/use-delete-oauth-connection";

export const OAuthConnRow = ({
	providerId,
	conns,
}: {
	providerId: OAuthProviderId;
	conns: OAuthConnection[];
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
