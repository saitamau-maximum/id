export interface ISocialLink {
	providerId: number;
	url: string;
	userId: string;
}

export type DeleteSocialLinkPayload = Omit<ISocialLink, "url">;

export interface ISocialLinkRepository {
	getSocialLinksByUserId: (
		userId: string,
	) => Promise<Omit<ISocialLink, "userId">[]>;
	createSocialLink: (socialLink: ISocialLink) => Promise<void>;
	updateSocialLink: (socialLink: ISocialLink) => Promise<void>;
	deleteSocialLink: (deleteSocialLinkPayload: 
		DeleteSocialLinkPayload,
	) => Promise<void>;
}
