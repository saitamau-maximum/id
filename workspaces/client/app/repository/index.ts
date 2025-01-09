import { AuthRepositoryImpl } from "./auth";
import { UserRepositoryImpl } from "./user";

export const DefaultRepositories = {
	authRepository: new AuthRepositoryImpl(),
	userRepository: new UserRepositoryImpl(),
};
