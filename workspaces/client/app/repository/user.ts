import { client } from "~/utils/hono";

interface RegisterParams {
	displayName: string;
	realName: string;
	realNameKana: string;
	displayId: string;
	academicEmail: string;
	email: string;
	studentId: string;
	grade: string;
}

interface UpdateParams {
	displayName: string;
	realName: string;
	realNameKana: string;
	displayId: string;
	academicEmail: string;
	email: string;
	studentId: string;
	grade: string;
}

export interface IUserRepository {
	register: (params: RegisterParams) => Promise<void>;
	update: (params: UpdateParams) => Promise<void>;
	getContributions: () => Promise<{
		weeks: {
			date: string;
			rate: number;
		}[][];
	}>;
	getContributions$$key: () => unknown[];
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
	}: RegisterParams) {
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
	}: UpdateParams) {
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
}
