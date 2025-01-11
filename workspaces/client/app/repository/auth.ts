import { client } from "~/utils/hono";
export type User = {
	id: string;
	initialized: boolean;
	displayName?: string;
	realName?: string;
	displayId?: string;
	profileImageURL?: string;
	email?: string;
	studentId?: string;
	grade?: string;
};

export interface IAuthRepository {
	me: () => Promise<User>;
	me$$key(): unknown[];
}

export class AuthRepositoryImpl implements IAuthRepository {
	async me() {
		const res = await client.auth.me.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch user");
		}
		return res.json();
	}
	me$$key() {
		return ["auth"];
	}
}
