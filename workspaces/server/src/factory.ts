import { createFactory } from "hono/factory";
import type { JwtVariables } from "hono/jwt";
import type { IContributionCacheRepository } from "./usecase/repository/cache";
import type { IContributionRepository } from "./usecase/repository/contribution";
import type { IOAuthRepository } from "./usecase/repository/oauth";
import type { IOrganizationRepository } from "./usecase/repository/organization";
import type { ISessionRepository } from "./usecase/repository/session";
import type { IUserRepository } from "./usecase/repository/user";

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
