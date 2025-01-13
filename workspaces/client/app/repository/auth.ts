import type { role } from "@idp/server/shared/role";
import { client } from "~/utils/hono";
export type User = {
	id: string;
	initialized: boolean;
	roles: role.Role[];
	displayName?: string;
	realName?: string;
	realNameKana?: string;
	displayId?: string;
	profileImageURL?: string;
	academicEmail?: string;
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
