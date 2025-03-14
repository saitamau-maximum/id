import type { Certification } from "~/types/certification";
import { client } from "~/utils/hono";

export interface CertificationRequestParams {
	certificationId: string;
	certifiedIn: number;
}

export interface ICertificationRepository {
	getAllCertifications(): Promise<Certification[]>;
	getAllCertifications$$key(): unknown[];
	requestCertification: (params: CertificationRequestParams) => Promise<void>;
}

export class CertificationRepositoryImpl implements ICertificationRepository {
	async getAllCertifications(): Promise<Certification[]> {
		const res = await client.certification.all.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch certifications");
		}
		return await res.json();
	}

	getAllCertifications$$key() {
		return ["certifications"];
	}

	async requestCertification({
		certificationId,
		certifiedIn,
	}: CertificationRequestParams) {
		const res = await client.certification.request.$post({
			json: {
				certificationId,
				certifiedIn,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to request certification");
		}
	}
}
