import { OAUTH_PROVIDER_IDS, OAUTH_PROVIDERS } from "@idp/server/shared/oauth";
import { css } from "styled-system/css";
import type { OAuthConnection } from "~/types/oauth-internal";

export const OAuthUserBadge = ({ conn }: { conn: OAuthConnection }) => {
	const profileImageUrl = conn.profileImageUrl
		? new URL(conn.profileImageUrl)
		: null;

	if (profileImageUrl) {
		switch (conn.providerId) {
			case OAUTH_PROVIDER_IDS.GITHUB:
				profileImageUrl.searchParams.set("s", "16");
				break;
			case OAUTH_PROVIDER_IDS.DISCORD:
				profileImageUrl.searchParams.set("size", "16");
				break;
		}
	}

	return (
		<>
			{profileImageUrl && (
				<img
					src={profileImageUrl.toString()}
					alt={OAUTH_PROVIDERS[conn.providerId].name}
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
	);
};
