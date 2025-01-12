import { client } from "~/utils/hono";

export interface IUserRepository {
	register: (
		displayName: string,
		realName: string,
		realNameKana: string,
		displayId: string,
		academicEmail: string,
		email: string,
		studentId: string,
		grade: string,
	) => Promise<void>;
	getContributions: () => Promise<{
		weeks: {
			date: string;
			rate: number;
		}[][];
	}>;
	getContributions$$key: () => unknown[];
}

export class UserRepositoryImpl implements IUserRepository {
	async register(
		displayName: string,
		realName: string,
		realNameKana: string,
		displayId: string,
		academicEmail: string,
		email: string,
		studentId: string,
		grade: string,
	) {
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
