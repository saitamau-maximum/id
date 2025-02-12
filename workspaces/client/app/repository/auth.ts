import type { User } from "~/types/user";
import { client } from "~/utils/hono";

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
