import type { User } from "@idp/schema/entity/user";
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
		const data = await res.json();
		return {
			...data,
			initializedAt: data.initializedAt ? new Date(data.initializedAt) : null,
			lastPaymentConfirmedAt: data.lastPaymentConfirmedAt
				? new Date(data.lastPaymentConfirmedAt)
				: null,
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
		};
	}
	me$$key() {
		return ["auth"];
	}
}
