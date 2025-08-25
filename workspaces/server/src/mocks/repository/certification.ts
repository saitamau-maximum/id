import { vi } from "vitest";
import type { ICertificationRepository } from "../../repository/certification";

export const createMockCertificationRepository =
	(): ICertificationRepository => {
		return {
			getAllCertifications: vi.fn(),
			requestCertification: vi.fn(),
			getAllCertificationRequests: vi.fn(),
			approveCertificationRequest: vi.fn(),
			rejectCertificationRequest: vi.fn(),
			existsCertification: vi.fn(),
			createCertification: vi.fn(),
			updateCertification: vi.fn(),
			deleteCertification: vi.fn(),
			existsUserCertification: vi.fn(),
			deleteUserCertification: vi.fn(),
		};
	};
