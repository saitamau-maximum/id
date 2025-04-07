export interface ISocialLink {
	userId: string;
	links: {
		providerId: number;
		url: string;
	}[];
}

export interface ISocialLinkRepository {
	getSocialLinksByUserId: (
		userId: string,
	) => Promise<ISocialLink>;
	updateSocialLinks: (socialLinks: ISocialLink) => Promise<void>;
}
