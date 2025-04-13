import { FaGithub, FaInstagram, FaKaggle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiGlobalLine } from "react-icons/ri";
import { SiCodeforces, SiZenn, SiQiita } from "react-icons/si";
import { GiLaurelsTrophy } from "react-icons/gi";
import { SOCIAL_SERVICES_IDS, type SocialServiceId } from "../../constant";

export const SocialIcon = ({ service }: { service: SocialServiceId }) => {
	switch (service) {
		case SOCIAL_SERVICES_IDS.GITHUB:
			return <FaGithub />;
		case SOCIAL_SERVICES_IDS.ATCODER:
			return <GiLaurelsTrophy />;
		case SOCIAL_SERVICES_IDS.X:
			return <FaXTwitter />;
		case SOCIAL_SERVICES_IDS.CODEFORCES:
			return <SiCodeforces />;
		case SOCIAL_SERVICES_IDS.INSTAGRAM:
			return <FaInstagram />;
		case SOCIAL_SERVICES_IDS.KAGGLE:
			return <FaKaggle />;
		case SOCIAL_SERVICES_IDS.ZENN:
			return <SiZenn />;
		case SOCIAL_SERVICES_IDS.QIITA:
			return <SiQiita />;
		default:
			return <RiGlobalLine />;
	}
};
