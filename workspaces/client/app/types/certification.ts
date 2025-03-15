export type Certification = {
	id: string;
	title: string;
	description: string;
};

export type UserCertification = Certification & {
	certifiedIn: number;
	isApproved: boolean;
};
