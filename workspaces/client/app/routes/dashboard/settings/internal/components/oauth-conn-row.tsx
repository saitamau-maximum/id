import {
	OAUTH_PROVIDER_IDS,
	OAUTH_PROVIDER_NAMES,
} from "@idp/server/shared/oauth";
import { GitHub } from "react-feather";
import { css } from "styled-system/css";
import { AnchorLike } from "~/components/ui/anchor-like";
import { Table } from "~/components/ui/table";
import type { OAuthConnection } from "~/types/oauth-internal";
import { env } from "~/utils/env";

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

	return (
		<Table.Tr>
			<ServiceTd providerId={providerId} />
			<Table.Td>
				{conn && (
					<>
						{conn.profileImageUrl && (
							<img
								src={conn.profileImageUrl}
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
				{/* TODO: 連携解除 */}
			</Table.Td>
		</Table.Tr>
	);
};
