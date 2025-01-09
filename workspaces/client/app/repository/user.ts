import { client } from "~/utils/hono";

export interface IUserRepository {
	register: (
		displayName: string,
		email: string,
		studentId: string,
		grade: string,
	) => Promise<void>;
}

export class UserRepositoryImpl implements IUserRepository {
	async register(
		displayName: string,
		email: string,
		studentId: string,
		grade: string,
	) {
		const res = await client.user.register.$post({
			json: {
				displayName,
				email,
				studentId,
				grade,
			},
		});
		if (!res.ok) {
			throw new Error("Failed to register user");
		}
	}
}
