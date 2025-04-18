import type { Member } from "@idp/schema/entity/member";
import type { User, UserProfile } from "@idp/schema/entity/user";

export type CreateUserPayload = Partial<UserProfile>;
export type CreateTemporaryUserPayload = Partial<UserProfile>;
export type RegisterUserPayload = Partial<UserProfile>;
export type UpdateUserPayload = Partial<UserProfile>;

export type FetchApprovedUsersRes = Omit<User, "certifications">[];
export type FetchMembersRes = Omit<Member, "certifications" | "bio">[];
export type FetchProvisionalUsersRes = (Omit<User, "certifications"> & {
	invitationId?: string;
	invitationTitle?: string;
})[];

export interface IUserRepository {
	createUser: (
		providerUserId: string,
		providerId: number,
		payload: CreateUserPayload,
	) => Promise<string>;
	createTemporaryUser: (
		providerUserId: string,
		providerId: number,
		invitationId: string,
		payload: CreateTemporaryUserPayload,
	) => Promise<string>;
	fetchUserIdByProviderInfo: (
		providerUserId: string,
		providerId: number,
	) => Promise<string>;
	fetchUserProfileById: (userId: string) => Promise<User>;
	fetchApprovedUsers: () => Promise<FetchApprovedUsersRes>;
	// 一覧ではcertificationsは必要ないので除外
	fetchMembers: () => Promise<FetchMembersRes>;
	fetchMemberByDisplayId: (displayId: string) => Promise<Member>;
	registerUser: (userId: string, payload: RegisterUserPayload) => Promise<void>;
	updateUser: (userId: string, payload: UpdateUserPayload) => Promise<void>;
	updateUserRole: (userId: string, roleIds: number[]) => Promise<void>;
	addUserRole: (userId: string, roleId: number) => Promise<void>;
	fetchRolesByUserId: (userId: string) => Promise<number[]>;
	fetchProvisionalUsers: () => Promise<FetchProvisionalUsersRes>;
	approveProvisionalUser: (userId: string) => Promise<void>;
	confirmPayment: (userId: string) => Promise<void>;
	rejectProvisionalUser: (userId: string) => Promise<void>;
}
