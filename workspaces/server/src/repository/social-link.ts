export interface ISocialLink {
	userId: string;
	links: {
		providerId: string;
		handle: string;
		url: string;
	}[];
}

export interface ISocialLinkRepository {
	getSocialLinksByUserId: (
		userId: string,
	) => Promise<ISocialLink>;
	updateSocialLinks: (userId: string, links: string[]) => Promise<void>;
}
