import type { ICertification } from "node_modules/@idp/server/dist/repository/certification";
import { client } from "~/utils/hono";

export interface ICertificationRepository {
	getAllCertifications(): Promise<ICertification[]>;
	getAllCertifications$$key(): string;
}

export class CertificationRepositoryImpl implements ICertificationRepository {
	async getAllCertifications(): Promise<ICertification[]> {
		const res = await client.certification.all.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch certifications");
		}
		return await res.json();
	}

	getAllCertifications$$key() {
		return "certifications";
	}
}
