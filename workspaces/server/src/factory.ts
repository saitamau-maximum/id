import { createFactory } from "hono/factory";
import type { JwtVariables } from "hono/jwt";
import type { IOauthRepository } from "./usecase/repository/oauth";
import type { ISessionRepository } from "./usecase/repository/session";
import type { IUserRepository } from "./usecase/repository/user";

export type HonoEnv = {
	Bindings: Env;
	Variables: {
		SessionRepository: ISessionRepository;
		UserRepository: IUserRepository;
		OauthRepository: IOauthRepository;
	} & JwtVariables<{ userId: string }>;
};

export const factory = createFactory<HonoEnv>();
