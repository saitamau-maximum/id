import type { Certification } from "~/types/certification";
import { client } from "~/utils/hono";

export interface CertificationRequestParams {
	certificationId: string;
	certifiedIn: number;
}

export interface CertificationRequestWithUser {
	user: {
		id: string;
		displayId: string | null;
		displayName: string | null;
		profileImageURL: string | null;
	};
	certificationId: string;
	certifiedIn: number;
}

export interface CertificationRequestReviewParams {
	userId: string;
	certificationId: string;
	isApproved: boolean;
}

export interface CertificationCreateParams {
	title: string;
	description?: string;
}

export interface CertificationUpdateParams {
	certificationId: string;
	description?: string;
}

export interface ICertificationRepository {
	getAllCertifications(): Promise<Certification[]>;
	getAllCertifications$$key(): unknown[];
	requestCertification: (params: CertificationRequestParams) => Promise<void>;
	getAllCertificationRequests: () => Promise<CertificationRequestWithUser[]>;
	getAllCertificationRequests$$key(): unknown[];
	reviewCertificationRequest: (
		params: CertificationRequestReviewParams,
	) => Promise<void>;
	createCertification: (params: CertificationCreateParams) => Promise<void>;
	updateCertification: (params: CertificationUpdateParams) => Promise<void>;
	deleteCertification: (certificationId: string) => Promise<void>;
	deleteUserCertification: (certificationId: string) => Promise<void>;
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

	async getAllCertificationRequests(): Promise<CertificationRequestWithUser[]> {
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

	async createCertification({ title, description }: CertificationCreateParams) {
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

	async updateCertification(params: CertificationUpdateParams) {
		const res = await client.certification[":certificationId"].$put({
			param: {
				certificationId: params.certificationId,
			},
			json: {
				description: params.description,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to update certification");
		}
	}

	async deleteCertification(certificationId: string) {
		const res = await client.certification[":certificationId"].$delete({
			param: {
				certificationId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete certification");
		}
	}

	async deleteUserCertification(certificationId: string) {
		const res = await client.certification[":certificationId"].my.$delete({
			param: {
				certificationId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete certification");
		}
	}
}
