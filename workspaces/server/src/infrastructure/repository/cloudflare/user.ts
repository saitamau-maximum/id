import { type InferInsertModel, and, eq } from "drizzle-orm";
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
		providerId: number,
		payload: Partial<Profile> = {},
	): Promise<string> {
		const userId = crypto.randomUUID();

		// d1にはtransactionがないのでbatchで両方成功を期待する
		const [_, res] = await this.client.batch([
			this.client.insert(schema.users).values({
				id: userId,
			}),
			this.client.insert(schema.oauthConnections).values({
				userId,
				providerId,
				providerUserId,
				email: payload.email,
				name: payload.displayName,
				profileImageUrl: payload.profileImageURL,
			}),
			this.client.insert(schema.userProfiles).values({
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
		providerId: number,
	): Promise<User> {
		const res = await this.client.query.oauthConnections.findFirst({
			where: (oauthConn, { eq, and }) =>
				and(
					eq(oauthConn.providerId, providerId),
					eq(oauthConn.providerUserId, providerUserId),
				),
			with: {
				user: {
					with: {
						profile: true,
					},
				},
			},
		});

		if (!res) {
			throw new Error("User not found");
		}

		return {
			id: res.user.id,
			initialized: !!res.user.initializedAt,
			displayName: res.user.profile.displayName ?? undefined,
			profileImageURL: res.user.profile.profileImageURL ?? undefined,
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
			initialized: !!user.initializedAt,
			displayName: user.profile.displayName ?? undefined,
			profileImageURL: user.profile.profileImageURL ?? undefined,
		};
	}

	async updateUser(userId: string, payload: Partial<Profile>): Promise<void> {
		const value: Omit<
			InferInsertModel<typeof schema.userProfiles>,
			"id" | "userId"
		> = {
			displayName: payload.displayName,
			profileImageURL: payload.profileImageURL,
			email: payload.email,
			studentId: payload.studentId,
			grade: payload.grade,
		};

		const [_, res] = await this.client.batch([
			this.client
				.update(schema.userProfiles)
				.set(value)
				.where(eq(schema.userProfiles.userId, userId)),
			this.client
				.update(schema.users)
				.set({
					initializedAt: new Date(),
				})
				.where(eq(schema.users.id, userId)),
		]);

		if (!res.success) {
			throw new Error("Failed to update user");
		}
	}
}
