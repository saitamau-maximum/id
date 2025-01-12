import { createFactory } from "hono/factory";
import type { JwtVariables } from "hono/jwt";
import type { IContributionCacheRepository } from "./repository/cache";
import type { IContributionRepository } from "./repository/contribution";
import type { IOAuthRepository } from "./repository/oauth";
import type { IOrganizationRepository } from "./repository/organization";
import type { ISessionRepository } from "./repository/session";
import type { IUserRepository } from "./repository/user";

export type HonoEnv = {
	Bindings: Env;
	Variables: {
		SessionRepository: ISessionRepository;
		UserRepository: IUserRepository;
		ContributionRepository: IContributionRepository;
		ContributionCacheRepository: IContributionCacheRepository;
		OAuthRepository: IOAuthRepository;
		OrganizationRepository: IOrganizationRepository;
		tokenInfo?: Awaited<ReturnType<IOAuthRepository["getTokenByAccessToken"]>>;
	} & JwtVariables<{ userId: string }>;
};

export const factory = createFactory<HonoEnv>();
