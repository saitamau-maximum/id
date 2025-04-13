import { FaGithub, FaInstagram, FaKaggle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiGlobalLine } from "react-icons/ri";
import { SiCodeforces, SiZenn, SiQiita } from "react-icons/si";
import { GiLaurelsTrophy } from "react-icons/gi";
import { SOCIAL_SERVICES_IDS, type SocialServiceId } from "../../constant";

interface SocialIconProps {
	service: SocialServiceId;
	size?: number;
}

export const SocialIcon = ({ service, size = 18 }: SocialIconProps) => {
	switch (service) {
		case SOCIAL_SERVICES_IDS.GITHUB:
			return <FaGithub size={size} />;
		case SOCIAL_SERVICES_IDS.ATCODER:
			return <GiLaurelsTrophy size={size} />;
		case SOCIAL_SERVICES_IDS.X:
			return <FaXTwitter size={size} />;
		case SOCIAL_SERVICES_IDS.CODEFORCES:
			return <SiCodeforces size={size} />;
		case SOCIAL_SERVICES_IDS.INSTAGRAM:
			return <FaInstagram size={size} />;
		case SOCIAL_SERVICES_IDS.KAGGLE:
			return <FaKaggle size={size} />;
		case SOCIAL_SERVICES_IDS.ZENN:
			return <SiZenn size={size} />;
		case SOCIAL_SERVICES_IDS.QIITA:
			return <SiQiita size={size} />;
		default:
			return <RiGlobalLine size={size} />;
	}
};
