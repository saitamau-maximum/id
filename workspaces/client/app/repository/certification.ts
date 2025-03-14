import type { Certification } from "~/types/certification";
import { client } from "~/utils/hono";

export interface CertificationRequestParams {
	certificationId: string;
	certifiedIn: number;
}

export interface CertificationRequest {
	userId: string;
	certificationId: string;
	certifiedIn: number;
}

export interface CertificationRequestReviewParams {
	userId: string;
	certificationId: string;
	isApproved: boolean;
}

export interface CertificationCreationParams {
	title: string;
	description?: string;
}

export interface ICertificationRepository {
	getAllCertifications(): Promise<Certification[]>;
	getAllCertifications$$key(): unknown[];
	requestCertification: (params: CertificationRequestParams) => Promise<void>;
	getAllCertificationRequests: () => Promise<CertificationRequest[]>;
	getAllCertificationRequests$$key(): unknown[];
	reviewCertificationRequest: (
		params: CertificationRequestReviewParams,
	) => Promise<void>;
	createCertification: (params: CertificationCreationParams) => Promise<void>;
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

	async getAllCertificationRequests(): Promise<CertificationRequest[]> {
		const res = await client.certification.request.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch certification requests");
		}
		return await res.json();
	}

	getAllCertificationRequests$$key() {
		return ["certificationRequests"];
	}

	async reviewCertificationRequest({
		userId,
		certificationId,
		isApproved,
	}: CertificationRequestReviewParams) {
		const res = await client.certification.review.$put({
			json: {
				userId,
				certificationId,
				isApproved,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to review certification request");
		}
	}

	async createCertification({
		title,
		description,
	}: CertificationCreationParams) {
		const res = await client.certification.create.$post({
			json: {
				title,
				description,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to create certification");
		}
	}
}
