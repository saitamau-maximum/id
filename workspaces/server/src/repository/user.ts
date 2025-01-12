import type { OAuthConnection } from "./oauth";

export type Profile = {
	displayName: string;
	realName: string;
	realNameKana: string;
	displayId: string;
	profileImageURL: string;
	academicEmail: string;
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

export type Member = {
	id: string;
	initialized: boolean;
} & Partial<
	Pick<
		Profile,
		| "displayName"
		| "realName"
		| "realNameKana"
		| "displayId"
		| "profileImageURL"
		| "grade"
	>
>;

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
	fetchMembers: () => Promise<Member[]>;
	registerUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
}
