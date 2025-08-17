import {
	OAUTH_PROVIDER_IDS,
	OAUTH_PROVIDER_NAMES,
} from "@idp/server/shared/oauth";
import { useCallback } from "react";
import { GitHub } from "react-feather";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { AnchorLike } from "~/components/ui/anchor-like";
import { Table } from "~/components/ui/table";
import type { OAuthConnection } from "~/types/oauth-internal";
import { env } from "~/utils/env";
import { useDeleteOAuthConnection } from "../hooks/use-delete-oauth-connection";

const ServiceTd = ({ providerId }: { providerId: number }) => {
	const iconClassName = css({
		display: "inline-block",
		marginRight: 2,
	});

	switch (providerId) {
		case OAUTH_PROVIDER_IDS.GITHUB:
			return (
				<Table.Td>
					<GitHub size={16} className={iconClassName} />
					GitHub
				</Table.Td>
			);
		case OAUTH_PROVIDER_IDS.DISCORD:
			return (
				<Table.Td>
					<img
						src="/discord.svg"
						alt="Discord logo"
						width={16}
						height={16}
						className={iconClassName}
					/>
					Discord
				</Table.Td>
			);
	}
};

export const OAuthConnRow = ({
	providerId,
	conns,
}: {
	providerId: number;
	conns: OAuthConnection[];
}) => {
	const conn = conns.find((conn) => conn.providerId === providerId);

	const loginSearchParams = new URLSearchParams();
	const continueToURL = window.location.href;
	loginSearchParams.set("continue_to", continueToURL);

	const { mutate } = useDeleteOAuthConnection();

	const handleDelete = useCallback(async () => {
		if (conn) {
			const res = await ConfirmDialog.call({
				title: `${OAUTH_PROVIDER_NAMES[providerId]} OAuth 連携の解除`,
				children: <DeleteConfirmation />,
				danger: true,
			});
			if (res.type === "dismiss") return;
			mutate(providerId);
		}
	}, [conn, providerId, mutate]);

	const profileImageUrl = conn?.profileImageUrl
		? new URL(conn.profileImageUrl)
		: null;

	if (profileImageUrl) {
		if (providerId === OAUTH_PROVIDER_IDS.GITHUB)
			profileImageUrl.searchParams.set("s", "16");

		if (providerId === OAUTH_PROVIDER_IDS.DISCORD)
			profileImageUrl.searchParams.set("size", "16");
	}

	return (
		<Table.Tr>
			<ServiceTd providerId={providerId} />
			<Table.Td>
				{conn && (
					<>
						{profileImageUrl && (
							<img
								src={profileImageUrl.toString()}
								alt={OAUTH_PROVIDER_NAMES[providerId]}
								width={16}
								height={16}
								className={css({
									borderRadius: "full",
									display: "inline-block",
									marginRight: 2,
								})}
							/>
						)}
						<span>{conn.name}</span>
					</>
				)}
			</Table.Td>
			<Table.Td>
				{providerId === OAUTH_PROVIDER_IDS.GITHUB && (
					<span>連携の解除はできません</span>
				)}
				{providerId !== OAUTH_PROVIDER_IDS.GITHUB && !conn && (
					<a
						href={`${env("SERVER_HOST")}/auth/login/${OAUTH_PROVIDER_NAMES[providerId].toLowerCase()}?${loginSearchParams.toString()}`}
					>
						<AnchorLike>連携する</AnchorLike>
					</a>
				)}
				{providerId !== OAUTH_PROVIDER_IDS.GITHUB && conn && (
					<>
						<a
							href={`${env("SERVER_HOST")}/auth/login/${OAUTH_PROVIDER_NAMES[providerId].toLowerCase()}?${loginSearchParams.toString()}`}
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
