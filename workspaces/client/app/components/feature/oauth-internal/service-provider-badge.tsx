import {
	OAUTH_PROVIDER_IDS,
	type OAuthProviderId,
} from "@idp/server/shared/oauth";
import { GitHub } from "react-feather";
import { css } from "styled-system/css";

export const OAuthServiceProviderBadge = ({
	providerId,
}: {
	providerId: OAuthProviderId;
}) => {
	const iconClassName = css({
		display: "inline-block",
		marginRight: 2,
	});

	switch (providerId) {
		case OAUTH_PROVIDER_IDS.GITHUB:
			return (
				<>
					<GitHub size={16} className={iconClassName} />
					GitHub
				</>
			);
		case OAUTH_PROVIDER_IDS.DISCORD:
			return (
				<>
					<img
						src="/discord.svg"
						alt="Discord logo"
						width={16}
						height={16}
						className={iconClassName}
					/>
					Discord
				</>
			);
	}

	throw new Error(`Unknown providerId: ${providerId}`);
};
