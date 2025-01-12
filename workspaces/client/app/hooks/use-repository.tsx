import { createContext, useContext } from "react";
import { DefaultRepositories } from "~/repository";
import type { IAuthRepository } from "~/repository/auth";
import type { IMemberRepository } from "~/repository/member";
import type { IUserRepository } from "~/repository/user";

export interface RepositoryContextProps {
	authRepository: IAuthRepository;
	userRepository: IUserRepository;
	memberRepository: IMemberRepository;
}

export const RepositoryContext =
	createContext<RepositoryContextProps>(DefaultRepositories);

interface LoadingProviderProps {
	children: React.ReactNode;
}

export const RepositoryProvider = ({ children }: LoadingProviderProps) => {
	return (
		<RepositoryContext.Provider value={DefaultRepositories}>
			{children}
		</RepositoryContext.Provider>
	);
};

export const useRepository = () => {
	return useContext(RepositoryContext);
};
