import { AuthRepositoryImpl } from "./auth";
import { MemberRepositoryImpl } from "./member";
import { UserRepositoryImpl } from "./user";

export const DefaultRepositories = {
	authRepository: new AuthRepositoryImpl(),
	userRepository: new UserRepositoryImpl(),
	memberRepository: new MemberRepositoryImpl(),
};
