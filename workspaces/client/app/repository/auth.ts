import type {
	User,
	WithCertifications,
	WithOAuthConnections,
} from "~/types/user";
import { client } from "~/utils/hono";

export interface IAuthRepository {
	me: () => Promise<WithOAuthConnections<WithCertifications<User>>>;
	me$$key(): unknown[];
	ping(): Promise<void>;
	ping$$key(): unknown[];
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
			initializedAt: data.initializedAt
				? new Date(data.initializedAt)
				: undefined,
			lastPaymentConfirmedAt: data.lastPaymentConfirmedAt
				? new Date(data.lastPaymentConfirmedAt)
				: undefined,
			updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
			lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : undefined,
		};
	}
	me$$key() {
		return ["auth"];
	}

	async ping() {
		const res = await client.auth.ping.$get();
		if (!res.ok) {
			throw new Error("Failed to ping");
		}
	}
	ping$$key() {
		return ["auth-ping"];
	}
}
