import { createFactory } from "hono/factory";
import type { JwtVariables } from "hono/jwt";
import type { IContributionCacheRepository } from "./repository/cache";
import type { IContributionRepository } from "./repository/contribution";
import type { IOAuthExternalRepository } from "./repository/oauth-external";
import type { IOAuthInternalRepository } from "./repository/oauth-internal";
import type { IOrganizationRepository } from "./repository/organization";
import type { ISessionRepository } from "./repository/session";
import type { IUserStorageRepository } from "./repository/storage";
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
		OrganizationRepository: IOrganizationRepository;
		UserStorageRepository: IUserStorageRepository;
		tokenInfo?: Awaited<
			ReturnType<IOAuthExternalRepository["getTokenByAccessToken"]>
		>;
	} & JwtVariables<{ userId: string }>;
};

export const factory = createFactory<HonoEnv>();
