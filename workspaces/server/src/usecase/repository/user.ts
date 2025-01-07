export type Profile = {
	displayName: string;
	profileImageURL: string;
};

export type User = {
	id: string;
} & Partial<Profile>;

export interface IUserRepository {
	createUser: (
		providerUserId: string,
		provider: string,
		payload: Partial<Profile>,
	) => Promise<string>;
	fetchUserByProviderInfo: (
		providerUserId: string,
		provider: string,
	) => Promise<User>;
	fetchUserById: (userId: string) => Promise<User>;
}
