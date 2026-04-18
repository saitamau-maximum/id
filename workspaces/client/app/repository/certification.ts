import type {
	CertificationCreateParams,
	CertificationRequestParams,
	CertificationReviewParams,
	CertificationUpdateParams,
	GetAllCertificationsResponse,
	GetCertificationRequestsResponse,
} from "@idp/schema/api/certification";
import type { Certification } from "@idp/schema/entity/certification";
import { client } from "~/utils/hono";

export interface ICertificationRepository {
	getAllCertifications(): Promise<GetAllCertificationsResponse>;
	getAllCertifications$$key(): unknown[];
	requestCertification: (params: CertificationRequestParams) => Promise<void>;
	getAllCertificationRequests: () => Promise<GetCertificationRequestsResponse>;
	getAllCertificationRequests$$key(): unknown[];
	reviewCertificationRequest: (
		params: CertificationReviewParams,
	) => Promise<void>;
	createCertification: (params: CertificationCreateParams) => Promise<void>;
	updateCertification: (
		certificationId: Certification["id"],
		params: CertificationUpdateParams,
	) => Promise<void>;
	deleteCertification: (certificationId: Certification["id"]) => Promise<void>;
	deleteUserCertification: (
		certificationId: Certification["id"],
	) => Promise<void>;
}

export class CertificationRepositoryImpl implements ICertificationRepository {
	async getAllCertifications(): Promise<GetAllCertificationsResponse> {
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

	async getAllCertificationRequests(): Promise<GetCertificationRequestsResponse> {
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
	}: CertificationReviewParams) {
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

	async updateCertification(
		certificationId: Certification["id"],
		params: CertificationUpdateParams,
	) {
		const res = await client.certification[":certificationId"].$put({
			param: {
				certificationId,
			},
			json: {
				description: params.description,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to update certification");
		}
	}

	async deleteCertification(certificationId: Certification["id"]) {
		const res = await client.certification[":certificationId"].$delete({
			param: {
				certificationId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete certification");
		}
	}

	async deleteUserCertification(certificationId: Certification["id"]) {
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
