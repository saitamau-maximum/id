import { createFactory } from "hono/factory";
import type { JwtVariables } from "hono/jwt";
import type { IContributionCacheRepository } from "./repository/cache";
import type { ICalendarRepository } from "./repository/calendar";
import type { IContributionRepository } from "./repository/contribution";
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
		tokenInfo?: Awaited<
			ReturnType<IOAuthExternalRepository["getTokenByAccessToken"]>
		>;
		oauthClientInfo?: Awaited<
			ReturnType<IOAuthExternalRepository["getClientById"]>
		>;
	} & JwtVariables<{ userId: string }>;
};

export const factory = createFactory<HonoEnv>();
