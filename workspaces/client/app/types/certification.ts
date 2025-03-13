export type Certification = {
	id: string;
	title: string;
	description: string | null;
};

export type UserCertification = Certification & {
	certifiedIn: number;
};
