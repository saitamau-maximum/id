export interface ICertification {
	id: string;
	title: string;
	description: string | null;
}

export interface ICertificationRequestParams {
	userId: string;
	certificationId: string;
	certifiedIn: number;
}

export interface ICertificationRepository {
	getAllCertifications: () => Promise<ICertification[]>;
	requestCertification: (params: ICertificationRequestParams) => Promise<void>;
}
