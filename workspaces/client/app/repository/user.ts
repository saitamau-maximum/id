import type { User } from "~/types/user";
import { client } from "~/utils/hono";

export interface UserRegisterParams {
	displayName: string;
	realName: string;
	realNameKana: string;
	displayId: string;
	academicEmail?: string;
	email: string;
	studentId?: string;
	grade: string;
}

export interface ProfileUpdateParams {
	displayName: string;
	realName: string;
	realNameKana: string;
	displayId: string;
	academicEmail?: string;
	email: string;
	studentId?: string;
	grade: string;
	bio: string;
	socialLinks: string[];
}

export interface IUserRepository {
	register: (params: UserRegisterParams) => Promise<void>;
	update: (params: ProfileUpdateParams) => Promise<void>;
	getContributions: () => Promise<{
		weeks: {
			date: string;
			rate: number;
		}[][];
	}>;
	getContributions$$key: () => unknown[];
	getAllUsers: () => Promise<User[]>;
	getAllUsers$$key: () => unknown[];
	updateUserRole: (userId: string, roleIds: number[]) => Promise<void>;
	updateUserProfileImage: (file: File) => Promise<void>;
	getAllProvisionalUsers: () => Promise<User[]>;
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
		bio,
		socialLinks,
	}: ProfileUpdateParams) {
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
			initializedAt: user.initializedAt
				? new Date(user.initializedAt)
				: undefined,
			lastPaymentConfirmedAt: user.lastPaymentConfirmedAt
				? new Date(user.lastPaymentConfirmedAt)
				: undefined,
			updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
			lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
		}));
	}

	getAllUsers$$key() {
		return ["users"];
	}

	async updateUserRole(userId: string, roleIds: number[]) {
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
			initializedAt: user.initializedAt
				? new Date(user.initializedAt)
				: undefined,
			lastPaymentConfirmedAt: user.lastPaymentConfirmedAt
				? new Date(user.lastPaymentConfirmedAt)
				: undefined,
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

	async findById(userId: string) {
	const res = await fetch(`/admin/users/${userId}`, {
		method: "GET",
		credentials: "include", // Cookie 認証なら必要
		headers: {
		"Content-Type": "application/json",
		// "Authorization": `Bearer ${token}`, // 必要なら
		},
	});

	if (!res.ok) {
		if (res.status === 404) return null;
		throw new Error("Failed to fetch user by id");
	}

	const data = await res.json();

	return {
		id: data.id,
		profile: {
		displayName: data.displayName ?? null,
		bio: data.bio ?? null,
		},
		socialLinks: data.socialLinks ?? [],
	};
	}
}
