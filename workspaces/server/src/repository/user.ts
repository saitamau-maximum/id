import type { Role } from "../constants/role";

export type Certification = {
	id: string;
	title: string;
	description: string | null;
	certifiedIn: number;
	isApproved: boolean;
};

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
	bio: string;
};

export type User = {
	id: string;
	initialized: boolean;
	roles: Role[];
} & Partial<Profile>;

export type UserWithCertifications = User & {
	certifications: Certification[];
};

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
		| "bio"
	>
>;

export type MemberWithCertifications = Member & {
	certifications: Certification[];
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
	fetchUserProfileById: (userId: string) => Promise<UserWithCertifications>;
	fetchAllUsers: () => Promise<User[]>;
	fetchMembers: () => Promise<Member[]>;
	fetchMemberByDisplayId: (
		displayId: string,
	) => Promise<MemberWithCertifications>;
	registerUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
	updateUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
	updateUserRole: (userId: string, roleIds: number[]) => Promise<void>;
	fetchRolesByUserId: (userId: string) => Promise<number[]>;
}
