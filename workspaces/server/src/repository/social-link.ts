export interface ISocialLink {
	providerId: string;
	url: string;
	userId: string;
}

export interface ISocialLinkRepository {
	getSocialLinksByUserId: (
		userId: string,
	) => Promise<Omit<ISocialLink, "userId">[]>;
	createSocialLink: (socialService: ISocialLink) => Promise<void>;
	updateSocialLink: (socialService: ISocialLink) => Promise<void>;
	deleteSocialLink: (userId: string, providerId: string) => Promise<void>;
}
