export interface ICertification {
	id: string;
	title: string;
	description: string | null;
}

export interface ICertificationRequest {
	userId: string;
	certificationId: string;
	certifiedIn: number;
}

export interface ICertificationRepository {
	getAllCertifications: () => Promise<ICertification[]>;
	requestCertification: (params: ICertificationRequest) => Promise<void>;
	getAllCertificationRequests: () => Promise<ICertificationRequest[]>;
	approveCertificationRequest(
		userId: string,
		certificationId: string,
	): Promise<void>;
	rejectCertificationRequest(
		userId: string,
		certificationId: string,
	): Promise<void>;
	createCertification: (params: Omit<ICertification, "id">) => Promise<void>;
}
