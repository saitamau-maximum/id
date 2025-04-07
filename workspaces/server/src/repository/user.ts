import type { Role } from "../constants/role";

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
	updatedAt: Date;
};

export type User = {
	id: string;
	initializedAt: Date | null;
	// 現状は authMiddleware を介しているため招待コードを載せる実装にしてもよいが、
	// 将来的に public API から招待コードが外部に漏洩するリスクを考慮し "仮登録か？" 状態だけ返すようにする
	isProvisional: boolean;
	roles: Role[];
} & Partial<Profile>;

export type UserWithCertifications = User & {
	certifications: Certification[];
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
	createTemporaryUser: (
		providerUserId: string,
		providerId: number,
		invitationId: string,
		payload: Partial<Profile>,
	) => Promise<string>;
	fetchUserIdByProviderInfo: (
		providerUserId: string,
		providerId: number,
	) => Promise<string>;
	fetchUserProfileById: (userId: string) => Promise<UserWithCertifications>;
	fetchApprovedUsers: () => Promise<User[]>;
	fetchMembers: () => Promise<Member[]>;
	fetchMemberByDisplayId: (
		displayId: string,
	) => Promise<MemberWithCertifications>;
	registerUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
	updateUser: (userId: string, payload: Partial<Profile>) => Promise<void>;
	updateUserRole: (userId: string, roleIds: number[]) => Promise<void>;
	fetchRolesByUserId: (userId: string) => Promise<number[]>;
	fetchProvisionalUsers: () => Promise<User[]>;
	approveProvisionalUser: (userId: string) => Promise<void>;
	rejectProvisionalUser: (userId: string) => Promise<void>;
}
