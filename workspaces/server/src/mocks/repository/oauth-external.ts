import { vi } from "vitest";
import type { IOAuthExternalRepository } from "../../repository/oauth-external";

export const createMockOAuthExternalRepository =
	(): IOAuthExternalRepository => {
		return {
			// common
			getClientById: vi.fn(),

			// management
			getClients: vi.fn(),
			updateManagers: vi.fn(),
			generateClientSecret: vi.fn(),
			updateClientSecretDescription: vi.fn(),
			deleteClientSecret: vi.fn(),
			registerClient: vi.fn(),
			updateClient: vi.fn(),
			deleteClient: vi.fn(),

			// OAuth flow
			createAccessToken: vi.fn(),
			getTokenByCode: vi.fn(),
			deleteTokenById: vi.fn(),
			setCodeUsed: vi.fn(),
			getTokenByAccessToken: vi.fn(),

			// cron
			deleteExpiredAccessTokens: vi.fn(),
		};
	};
