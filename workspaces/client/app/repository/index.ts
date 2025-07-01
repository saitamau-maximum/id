import { AuthRepositoryImpl } from "./auth";
import { CalendarRepositoryImpl } from "./calendar";
import { CertificationRepositoryImpl } from "./certification";
import { DiscordRepositoryImpl } from "./discord";
import { InvitationRepositoryImpl } from "./invitation";
import { LocationRepositoryImpl } from "./location";
import { MemberRepositoryImpl } from "./member";
import { MiscRepositoryImpl } from "./misc";
import { OAuthAppsRepositoryImpl } from "./oauth-apps";
import { UserRepositoryImpl } from "./user";

export const DefaultRepositories = {
	authRepository: new AuthRepositoryImpl(),
	userRepository: new UserRepositoryImpl(),
	memberRepository: new MemberRepositoryImpl(),
	oauthAppsRepository: new OAuthAppsRepositoryImpl(),
	calendarRepository: new CalendarRepositoryImpl(),
	certificationRepository: new CertificationRepositoryImpl(),
	locationRepository: new LocationRepositoryImpl(),
	invitationRepository: new InvitationRepositoryImpl(),
	miscRepository: new MiscRepositoryImpl(),
	discordRepository: new DiscordRepositoryImpl(),
};
