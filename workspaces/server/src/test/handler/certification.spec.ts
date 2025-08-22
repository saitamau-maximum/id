import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HonoEnv } from "../../factory";
import type {
	ICertification,
	ICertificationRepository,
} from "../../repository/certification";
import { certificationRoute } from "../../routes/certification";

const createMockCertificationRepository = (): ICertificationRepository => {
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

describe("Certification Handler", () => {
	let app: Hono<HonoEnv>;
	let mockRepository: ICertificationRepository;

	beforeEach(() => {
		app = new Hono<HonoEnv>();
		mockRepository = createMockCertificationRepository();

		const repositoryInjector = createMiddleware<HonoEnv>(async (c, next) => {
			c.set("CertificationRepository", mockRepository);
			await next();
		});

		app.use(repositoryInjector);
		app.route("/certification", certificationRoute);
	});

	describe("GET /certification/all", () => {
		it("should get all certifications", async () => {
			const mockData: ICertification[] = [
				{
					id: "1",
					title: "Certification 1",
					description: "Description 1",
				},
				{
					id: "2",
					title: "Certification 2",
					description: "Description 2",
				},
			];

			vi.mocked(mockRepository.getAllCertifications).mockResolvedValue(
				mockData,
			);

			const response = await app.request("/certification/all");
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual(mockData);
		});

		it("should return empty array when no certifications exist", async () => {
			vi.mocked(mockRepository.getAllCertifications).mockResolvedValue([]);

			const response = await app.request("/certification/all");
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual([]);
		});

		it("should handle errors gracefully", async () => {
			vi.mocked(mockRepository.getAllCertifications).mockRejectedValue(
				new Error("Database error"),
			);
			const response = await app.request("/certification/all");

			expect(response.status).toBe(500);
		});
	});
});
