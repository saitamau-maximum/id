import type { OAuthConnection } from "./oauth";

export type Profile = {
	displayName: string;
	realName: string;
	displayId: string;
	profileImageURL: string;
	email: string;
	studentId: string;
	grade: string;
};

export type User = {
	id: string;
	initialized: boolean;
} & Partial<Profile>;

export type UserWithOAuthConnection = User & {
	oauthConnections: OAuthConnection[];
};

export interface IUserRepository {
	createUser: (
		providerUserId: string,
		providerId: number,
		payload: Partial<Profile>,
	) => Promise<string>;
	fetchUserIdByProviderInfo: (
		providerUserId: string,
		providerId: number,
	) => Promise<string>;
	fetchUserProfileById: (userId: string) => Promise<User>;
	fetchUserWithOAuthConnectionById: (
		userId: string,
	) => Promise<UserWithOAuthConnection>;
	updateUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
}
