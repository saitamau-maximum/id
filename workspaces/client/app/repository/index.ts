import { AuthRepositoryImpl } from "./auth";
import { CalendarRepositoryImpl } from "./calendar";
import { CertificationRepositoryImpl } from "./certification";
import { LocationRepositoryImpl } from "./location";
import { MemberRepositoryImpl } from "./member";
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
};
