import { createFactory } from "hono/factory";
import type { JwtVariables } from "hono/jwt";
import type { IContributionCacheRepository } from "./repository/cache";
import type {
	ICalendarNotifier,
	ICalendarRepository,
} from "./repository/calendar";
import type { ICertificationRepository } from "./repository/certification";
import type { IContributionRepository } from "./repository/contribution";
import type { IInviteRepository } from "./repository/invite";
import type { ILocationRepository } from "./repository/location";
import type { IOAuthExternalRepository } from "./repository/oauth-external";
import type { IOAuthInternalRepository } from "./repository/oauth-internal";
import type { IOrganizationRepository } from "./repository/organization";
import type { ISessionRepository } from "./repository/session";
import type {
	IOAuthAppStorageRepository,
	IUserStorageRepository,
} from "./repository/storage";
import type { IUserRepository } from "./repository/user";

export type HonoEnv = {
	Bindings: Env;
	Variables: {
		SessionRepository: ISessionRepository;
		UserRepository: IUserRepository;
		ContributionRepository: IContributionRepository;
		ContributionCacheRepository: IContributionCacheRepository;
		OAuthExternalRepository: IOAuthExternalRepository;
		OAuthInternalRepository: IOAuthInternalRepository;
		OAuthAppStorageRepository: IOAuthAppStorageRepository;
		OrganizationRepository: IOrganizationRepository;
		UserStorageRepository: IUserStorageRepository;
		CalendarRepository: ICalendarRepository;
		CalendarNotifier: ICalendarNotifier;
		CertificationRepository: ICertificationRepository;
		InviteRepository: IInviteRepository;
		LocationRepository: ILocationRepository;
		tokenInfo?: Awaited<
			ReturnType<IOAuthExternalRepository["getTokenByAccessToken"]>
		>;
		oauthClientInfo?: Awaited<
			ReturnType<IOAuthExternalRepository["getClientById"]>
		>;
		roleIds: number[];
	} & JwtVariables<{ userId: string }>;
};

export const factory = createFactory<HonoEnv>();
