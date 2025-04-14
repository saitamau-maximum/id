import { SOCIAL_SERVICES_IDS, type SocialServiceId } from "../../constant";

interface SocialIconProps {
	service: SocialServiceId;
	size?: number;
}

export const SocialIcon = ({ service, size = 18 }: SocialIconProps) => {
	switch (service) {
		case SOCIAL_SERVICES_IDS.GITHUB:
			return <img src="/github.svg" alt="GitHub" width={size} height={size} />;
		case SOCIAL_SERVICES_IDS.ATCODER:
			return (
				<img src="/atcoder.svg" alt="AtCoder" width={size} height={size} />
			);
		case SOCIAL_SERVICES_IDS.X:
			return <img src="/x.svg" alt="X" width={size} height={size} />;
		case SOCIAL_SERVICES_IDS.CODEFORCES:
			return (
				<img
					src="/codeforces.svg"
					alt="Codeforces"
					width={size}
					height={size}
				/>
			);
		case SOCIAL_SERVICES_IDS.INSTAGRAM:
			return (
				<img src="/instagram.svg" alt="Instagram" width={size} height={size} />
			);
		case SOCIAL_SERVICES_IDS.KAGGLE:
			return <img src="/kaggle.svg" alt="Kaggle" width={size} height={size} />;
		case SOCIAL_SERVICES_IDS.ZENN:
			return <img src="/zenn.svg" alt="Zenn" width={size} height={size} />;
		case SOCIAL_SERVICES_IDS.QIITA:
			return <img src="/qiita.svg" alt="Qiita" width={size} height={size} />;
		default:
			return <img src="/globe.svg" alt="Other" width={size} height={size} />;
	}
};
