import type { Member, PublicMember } from "@idp/schema/entity/member";
import type { RoleId } from "@idp/schema/entity/role";
import type { DashboardUser, User, UserProfile } from "@idp/schema/entity/user";

export type CreateUserPayload = Partial<UserProfile>;
export type CreateTemporaryUserPayload = Partial<UserProfile>;
export type RegisterUserPayload = Partial<UserProfile>;
export type UpdateUserPayload = Partial<UserProfile>;

export type FetchApprovedUsersRes = Omit<
	User,
	"certifications" | "oauthConnections"
>[];
export type FetchMembersRes = Omit<
	Member,
	"certifications" | "oauthConnections"
>[];
export type FetchProvisionalUsersRes = Omit<
	User,
	"certifications" | "oauthConnections"
>[];

export interface IUserRepository {
	createUser: (payload: CreateUserPayload) => Promise<string>;
	createTemporaryUser: (
		invitationId: string,
		payload: CreateTemporaryUserPayload,
	) => Promise<string>;
	applyInvitationToExistingUser: (
		userId: string,
		invitationId: string,
	) => Promise<void>;
	fetchUserProfileById: (userId: string) => Promise<User>;
	fetchAllUsers: () => Promise<DashboardUser[]>;
	fetchApprovedUsers: () => Promise<FetchApprovedUsersRes>;
	fetchMembers: () => Promise<FetchMembersRes>;
	fetchMemberByDisplayId: (displayId: string) => Promise<Member>;
	registerUser: (userId: string, payload: RegisterUserPayload) => Promise<void>;
	updateUser: (userId: string, payload: UpdateUserPayload) => Promise<void>;
	updateUserRole: (userId: string, roleIds: RoleId[]) => Promise<void>;
	addUserRole: (userId: string, roleId: RoleId) => Promise<void>;
	fetchRolesByUserId: (userId: string) => Promise<RoleId[]>;
	fetchProvisionalUsers: () => Promise<FetchProvisionalUsersRes>;
	approveProvisionalUser: (userId: string) => Promise<void>;
	confirmPayment: (userId: string) => Promise<void>;
	rejectProvisionalUser: (userId: string) => Promise<void>;
	updateLastLoginAt: (userId: string) => Promise<void>;
	fetchPublicMemberByDisplayId(displayId: string): Promise<PublicMember | null>;
	removeMemberRoleFromUsersBefore: (
		lastPaymentConfirmedAt: Date,
	) => Promise<number>;
}
