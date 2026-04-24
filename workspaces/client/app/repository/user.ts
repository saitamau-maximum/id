import type {
	AdminUserGetProvisionalUsersResponse,
	AdminUserGetUsersResponse,
} from "@idp/schema/api/admin/user";
import type {
	UserGetContributionsResponse,
	UserProfileUpdateParams,
	UserRegisterParams,
} from "@idp/schema/api/user";
import type { RoleId } from "@idp/schema/entity/role";
import { client } from "~/utils/hono";

export interface IUserRepository {
	register: (params: UserRegisterParams) => Promise<void>;
	update: (params: UserProfileUpdateParams) => Promise<void>;
	getContributions: () => Promise<UserGetContributionsResponse>;
	getContributions$$key: () => unknown[];

	getAllUsers: () => Promise<AdminUserGetUsersResponse>;
	getAllUsers$$key: () => unknown[];
	updateUserRole: (userId: string, roleIds: RoleId[]) => Promise<void>;
	updateUserProfileImage: (file: File) => Promise<void>;
	getAllProvisionalUsers: () => Promise<AdminUserGetProvisionalUsersResponse>;
	getAllProvisionalUsers$$key: () => unknown[];
	approveInvitation: (userId: string) => Promise<void>;
	rejectInvitation: (userId: string) => Promise<void>;
	confirmPayment: (userId: string) => Promise<void>;
	deleteOAuthConnection: (providerId: number) => Promise<void>;
}

export class UserRepositoryImpl implements IUserRepository {
	async register({
		displayName,
		realName,
		realNameKana,
		displayId,
		academicEmail,
		email,
		studentId,
		grade,
		faculty,
		department,
		laboratory,
		graduateSchool,
		specialization,
	}: UserRegisterParams) {
		const res = await client.user.register.$post({
			json: {
				displayName,
				realName,
				realNameKana,
				displayId,
				academicEmail,
				email,
				studentId,
				grade,
				faculty,
				department,
				laboratory,
				graduateSchool,
				specialization,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to register user");
		}
	}

	async update({
		displayName,
		realName,
		realNameKana,
		displayId,
		academicEmail,
		email,
		studentId,
		grade,
		faculty,
		department,
		laboratory,
		graduateSchool,
		specialization,
		bio,
		socialLinks,
	}: UserProfileUpdateParams) {
		const res = await client.user.update.$put({
			json: {
				displayName,
				realName,
				realNameKana,
				displayId,
				academicEmail,
				email,
				studentId,
				grade,
				faculty,
				department,
				laboratory,
				graduateSchool,
				specialization,
				bio,
				socialLinks,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to update user");
		}
	}

	async getContributions() {
		const res = await client.user.contributions.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch contributions");
		}
		return res.json();
	}

	getContributions$$key() {
		return ["contribution"];
	}

	async getAllUsers() {
		const res = await client.admin.users.list.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch users");
		}
		const data = await res.json();
		return data.map((user) => ({
			...user,
			initializedAt: user.initializedAt ? new Date(user.initializedAt) : null,
			lastPaymentConfirmedAt: user.lastPaymentConfirmedAt
				? new Date(user.lastPaymentConfirmedAt)
				: null,
			updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
			lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
		}));
	}

	getAllUsers$$key() {
		return ["users"];
	}

	async updateUserRole(userId: string, roleIds: RoleId[]) {
		const res = await client.admin.users[":userId"].role.$put({
			param: {
				userId,
			},
			json: {
				roleIds,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to update user role");
		}
	}

	async updateUserProfileImage(file: File) {
		const res = await client.user["profile-image"].$put({
			form: {
				image: file,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to update user profile image");
		}
	}

	async getAllProvisionalUsers() {
		const res = await client.admin.users.provisional.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch provisional users");
		}
		const data = await res.json();
		return data.map((user) => ({
			...user,
			initializedAt: user.initializedAt ? new Date(user.initializedAt) : null,
			lastPaymentConfirmedAt: user.lastPaymentConfirmedAt
				? new Date(user.lastPaymentConfirmedAt)
				: null,
			updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
			lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
		}));
	}

	getAllProvisionalUsers$$key() {
		return ["provisional-users"];
	}

	async approveInvitation(userId: string) {
		const res = await client.admin.users[":userId"].approve.$post({
			param: {
				userId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to approve invitation");
		}
	}

	async rejectInvitation(userId: string) {
		const res = await client.admin.users[":userId"].reject.$post({
			param: {
				userId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to reject invitation");
		}
	}

	async confirmPayment(userId: string) {
		const res = await client.admin.users[":userId"]["confirm-payment"].$post({
			param: {
				userId,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to confirm payment");
		}
	}

	async deleteOAuthConnection(providerId: number) {
		const res = await client.user["oauth-connection"][":providerId"].$delete({
			param: {
				providerId: providerId.toString(),
			},
		});
		if (!res.ok) {
			throw new Error("Failed to delete OAuth connection");
		}
	}
}
