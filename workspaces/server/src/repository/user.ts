import type { Role } from "../constants/role";
import type { PublicMember } from "../infrastructure/repository/cloudflare/user";
import type { OAuthConnection } from "./oauth-internal";

export type Certification = {
	id: string;
	title: string;
	description: string;
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
	socialLinks: string[];
	updatedAt: Date;
};

export type User = {
	id: string;
	initializedAt: Date | null;
	// 現状は authMiddleware を介しているため招待コードを載せる実装にしてもよいが、
	// 将来的に public API から招待コードが外部に漏洩するリスクを考慮し "仮登録か？" 状態だけ返すようにする
	isProvisional: boolean;
	lastPaymentConfirmedAt: Date | null;
	lastLoginAt?: Date | null;
	roles: Role[];
} & Partial<Profile>;

export type DashboardUser = {
	id: string;
	initializedAt: Date | null;
	lastLoginAt: Date | null;
	isProvisional: boolean;
	grade?: string;
	roles: Role[];
};

export type Member = User &
	Partial<
		Pick<
			Profile,
			| "displayName"
			| "realName"
			| "realNameKana"
			| "displayId"
			| "profileImageURL"
			| "grade"
			| "bio"
			| "socialLinks"
		>
	>;

export type WithCertifications<T> = T & {
	certifications: Certification[];
};

export type WithOAuthConnections<T> = T & {
	oauthConnections: Omit<OAuthConnection, "userId" | "email">[];
};

export interface IUserRepository {
	createUser: (payload: Partial<Profile>) => Promise<string>;
	createTemporaryUser: (
		invitationId: string,
		payload: Partial<Profile>,
	) => Promise<string>;
	fetchUserProfileById: (
		userId: string,
	) => Promise<WithOAuthConnections<WithCertifications<User>>>;
	fetchAllUsers: () => Promise<DashboardUser[]>;
	fetchApprovedUsers: () => Promise<User[]>;
	fetchMembers: () => Promise<Member[]>;
	fetchMemberByDisplayId: (
		displayId: string,
	) => Promise<WithOAuthConnections<WithCertifications<Member>>>;
	registerUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
	updateUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
	updateUserRole: (userId: string, roleIds: number[]) => Promise<void>;
	addUserRole: (userId: string, roleId: number) => Promise<void>;
	fetchRolesByUserId: (userId: string) => Promise<number[]>;
	fetchProvisionalUsers: () => Promise<User[]>;
	approveProvisionalUser: (userId: string) => Promise<void>;
	confirmPayment: (userId: string) => Promise<void>;
	rejectProvisionalUser: (userId: string) => Promise<void>;
	updateLastLoginAt: (userId: string) => Promise<void>;
	fetchPublicMemberByDisplayId(displayId: string): Promise<PublicMember | null>;
}
