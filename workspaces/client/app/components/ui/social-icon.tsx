import { ICON, type SocialServiceId } from "../../constant";

interface SocialIconProps {
	service: SocialServiceId;
	size?: number;
}

export const SocialIcon = ({ service, size = 18 }: SocialIconProps) => {
	const { src, alt } = ICON[service];
	return <img src={src} alt={alt} width={size} height={size} />;
};
