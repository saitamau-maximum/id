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
