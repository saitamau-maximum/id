import type { UserWithCertifications } from "~/types/user";
import { client } from "~/utils/hono";

export interface IAuthRepository {
	me: () => Promise<UserWithCertifications>;
	me$$key(): unknown[];
}

export class AuthRepositoryImpl implements IAuthRepository {
	async me() {
		const res = await client.auth.me.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch user");
		}
		const data = await res.json();
		return {
			...data,
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
		};
	}
	me$$key() {
		return ["auth"];
	}
}
