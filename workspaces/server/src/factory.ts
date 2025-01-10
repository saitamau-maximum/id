import { createFactory } from "hono/factory";
import type { JwtVariables } from "hono/jwt";
import type { IOAuthRepository } from "./usecase/repository/oauth";
import type { ISessionRepository } from "./usecase/repository/session";
import type { IUserRepository } from "./usecase/repository/user";

export type HonoEnv = {
	Bindings: Env;
	Variables: {
		SessionRepository: ISessionRepository;
		UserRepository: IUserRepository;
		OAuthRepository: IOAuthRepository;
		tokenInfo?: Awaited<ReturnType<IOAuthRepository["getTokenByAccessToken"]>>;
	} & JwtVariables<{ userId: string }>;
};

export const factory = createFactory<HonoEnv>();
