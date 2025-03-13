export interface ICertification {
	id: string;
	title: string;
	description: string | null;
}

export interface ICertificationRepository {
	getAllCertifications: () => Promise<ICertification[]>;
}
