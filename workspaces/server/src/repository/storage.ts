export interface IUserStorageRepository {
	/**
	 * Uploads a profile image for the user.
	 * @param blob - The image blob to upload.
	 * @param userId - The user ID.
	 */
	uploadProfileImage: (blob: Blob, userId: string) => Promise<void>;
	/**
	 * Gets the URL of the profile image for the user.
	 * @param userId - The user ID.
	 * @returns A readable stream of the profile image.
	 */
	getProfileImageURL: (userId: string) => Promise<ReadableStream>;
}

export interface IOAuthAppStorageRepository {
	/**
	 * Uploads a OAuth app icon.
	 * @param blob - The image blob to upload.
	 * @param appId - The app ID.
	 */
	uploadAppIcon: (blob: Blob, appId: string) => Promise<void>;
	/**
	 * Gets the URL of the OAuth app icon.
	 * @param appId - The app ID.
	 * @returns A readable stream of the app icon.
	 */
	getAppIconURL: (appId: string) => Promise<ReadableStream>;
}
