export type Profile = {
	displayName: string;
	profileImageURL: string;
	email: string;
	studentId: string;
	grade: string;
};

export type User = {
	id: string;
	initialized: boolean;
	providerUserId: string;
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
	updateUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
}
