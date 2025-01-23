import { AuthRepositoryImpl } from "./auth";
import { MemberRepositoryImpl } from "./member";
import { OAuthAppsRepositoryImpl } from "./oauth-apps";
import { UserRepositoryImpl } from "./user";

export const DefaultRepositories = {
	authRepository: new AuthRepositoryImpl(),
	userRepository: new UserRepositoryImpl(),
	memberRepository: new MemberRepositoryImpl(),
	oauthAppsRepository: new OAuthAppsRepositoryImpl(),
};
