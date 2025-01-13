import type { Role } from "../constants/role";

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
	roles: Role[];
} & Partial<Profile>;

export type Member = {
	id: string;
	initialized: boolean;
	roles: Role[];
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
	fetchMembers: () => Promise<Member[]>;
	fetchMemberByDisplayId: (displayId: string) => Promise<Member>;
	registerUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
	updateUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
	fetchRolesByUserId: (userId: string) => Promise<number[]>;
}
