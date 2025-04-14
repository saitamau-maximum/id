import { createContext, useContext } from "react";
import { DefaultRepositories } from "~/repository";
import type { IAuthRepository } from "~/repository/auth";
import type { ICalendarRepository } from "~/repository/calendar";
import type { ICertificationRepository } from "~/repository/certification";
import type { IInvitationRepository } from "~/repository/invitation";
import type { ILocationRepository } from "~/repository/location";
import type { IMemberRepository } from "~/repository/member";
import type { IMiscRepository } from "~/repository/misc";
import type { IOAuthAppsRepository } from "~/repository/oauth-apps";
import type { IUserRepository } from "~/repository/user";

export interface RepositoryContextProps {
	authRepository: IAuthRepository;
	userRepository: IUserRepository;
	memberRepository: IMemberRepository;
	oauthAppsRepository: IOAuthAppsRepository;
	calendarRepository: ICalendarRepository;
	certificationRepository: ICertificationRepository;
	locationRepository: ILocationRepository;
	invitationRepository: IInvitationRepository;
	miscRepository: IMiscRepository;
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
