import type { User } from "~/types/user";
import { client } from "~/utils/hono";

export interface UserRegisterParams {
	displayName: string;
	realName: string;
	realNameKana: string;
	displayId: string;
	academicEmail: string;
	email: string;
	studentId: string;
	grade: string;
}

export interface ProfileUpdateParams {
	displayName: string;
	realName: string;
	realNameKana: string;
	displayId: string;
	academicEmail: string;
	email: string;
	studentId: string;
	grade: string;
	bio: string;
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
	getAllPendingUsers: () => Promise<User[]>;
	getAllPendingUsers$$key: () => unknown[];
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
			updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
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

	async getAllPendingUsers() {
		const res = await client.admin.users.pending.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch pending users");
		}
		const data = await res.json();
		return data.map((user) => ({
			...user,
			initializedAt: user.initializedAt
				? new Date(user.initializedAt)
				: undefined,
			updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
		}));
	}

	getAllPendingUsers$$key() {
		return ["pending-users"];
	}
}
