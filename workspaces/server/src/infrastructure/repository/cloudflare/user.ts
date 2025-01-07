import { and, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	IUserRepository,
	Profile,
	User,
} from "./../../../usecase/repository/user";

export class CloudflareUserRepository implements IUserRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async createUser(
		providerUserId: string,
		provider: string,
		payload: Partial<Profile> = {},
	): Promise<string> {
		const userId = crypto.randomUUID();

		// d1にはtransactionがないのでbatchで両方成功を期待する
		const [_, res] = await this.client.batch([
			this.client.insert(schema.users).values({
				id: userId,
				providerUserId,
				provider,
			}),
			this.client.insert(schema.usersProfile).values({
				id: crypto.randomUUID(),
				userId,
				displayName: payload.displayName,
				profileImageURL: payload.profileImageURL,
			}),
		]);

		if (res.success) {
			return userId;
		}

		throw new Error("Failed to create user");
	}

	async fetchUserByProviderInfo(
		providerUserId: string,
		provider: string,
	): Promise<User> {
		const user = await this.client.query.users.findFirst({
			where: and(
				eq(schema.users.providerUserId, providerUserId),
				eq(schema.users.provider, provider),
			),
			with: {
				profile: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return {
			id: user.id,
			displayName: user.profile.displayName ?? undefined,
			profileImageURL: user.profile.profileImageURL ?? undefined,
		};
	}

	async fetchUserById(userId: string): Promise<User> {
		const user = await this.client.query.users.findFirst({
			where: eq(schema.users.id, userId),
			with: {
				profile: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return {
			id: user.id,
			displayName: user.profile.displayName ?? undefined,
			profileImageURL: user.profile.profileImageURL ?? undefined,
		};
	}
}
