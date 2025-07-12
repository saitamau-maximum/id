import { createFactory } from "hono/factory";
import type { JwtVariables } from "hono/jwt";
import type { IContributionCacheRepository } from "./repository/cache";
import type {
	ICalendarNotifier,
	ICalendarRepository,
} from "./repository/calendar";
import type { ICertificationRepository } from "./repository/certification";
import type { IContributionRepository } from "./repository/contribution";
import type { IDiscordBotRepository } from "./repository/discord-bot";
import type { IEquipmentRepository } from "./repository/equipment";
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
		// ----- IdP Core ----- //
		// ユーザー・セッション
		SessionRepository: ISessionRepository;
		UserRepository: IUserRepository;
		// Storage
		UserStorageRepository: IUserStorageRepository;
		OAuthAppStorageRepository: IOAuthAppStorageRepository;
		// キャッシュ
		ContributionCacheRepository: IContributionCacheRepository;
		// カレンダー
		CalendarRepository: ICalendarRepository;
		CalendarNotifier: ICalendarNotifier;
		LocationRepository: ILocationRepository;
		// 資格・試験
		CertificationRepository: ICertificationRepository;
		// 備品管理
		EquipmentRepository: IEquipmentRepository;
		// 招待
		InviteRepository: IInviteRepository;
		// ----- IdP OAuth & Connect ----- //
		// 内外の OAuth 関連
		OAuthInternalRepository: IOAuthInternalRepository;
		OAuthExternalRepository: IOAuthExternalRepository;
		// GitHub 関連
		ContributionRepository: IContributionRepository;
		OrganizationRepository: IOrganizationRepository;
		// Discord 関連
		DiscordBotRepository: IDiscordBotRepository;
		// ----- Dynamic Variables ----- //
		roleIds: number[];
		tokenInfo?: Awaited<
			ReturnType<IOAuthExternalRepository["getTokenByAccessToken"]>
		>;
		oauthClientInfo?: Awaited<
			ReturnType<IOAuthExternalRepository["getClientById"]>
		>;
	} & JwtVariables<{ userId: string }>;
};

export const factory = createFactory<HonoEnv>();
