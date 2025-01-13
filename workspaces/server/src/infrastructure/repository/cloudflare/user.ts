import { type InferInsertModel, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { ROLE_IDS } from "../../../constants/role";
import * as schema from "../../../db/schema";
import type {
	IUserRepository,
	Member,
	Profile,
	User,
} from "./../../../repository/user";

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

	async fetchUserIdByProviderInfo(
		providerUserId: string,
		providerId: number,
	): Promise<string> {
		const res = await this.client.query.oauthConnections.findFirst({
			where: (oauthConn, { eq, and }) =>
				and(
					eq(oauthConn.providerId, providerId),
					eq(oauthConn.providerUserId, providerUserId),
				),
		});

		if (!res) {
			throw new Error("User not found");
		}

		return res.userId;
	}

	async fetchUserProfileById(userId: string): Promise<User> {
		const user = await this.client.query.users.findFirst({
			where: eq(schema.users.id, userId),
			with: {
				roles: true,
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
			realName: user.profile.realName ?? undefined,
			realNameKana: user.profile.realNameKana ?? undefined,
			displayId: user.profile.displayId ?? undefined,
			profileImageURL: user.profile.profileImageURL ?? undefined,
			academicEmail: user.profile.academicEmail ?? undefined,
			email: user.profile.email ?? undefined,
			studentId: user.profile.studentId ?? undefined,
			grade: user.profile.grade ?? undefined,
			rolesIds: user.roles.map((role) => role.roleId),
		};
	}

	async registerUser(userId: string, payload: Partial<Profile>): Promise<void> {
		// userが登録済みかどうか確認
		const user = await this.client.query.users.findFirst({
			where: eq(schema.users.id, userId),
		});
		if (!user) {
			throw new Error("User not found");
		}
		if (user.initializedAt !== null) {
			throw new Error("User already initialized");
		}

		// userが登録済みでない場合、userProfilesに登録
		const value: Omit<
			InferInsertModel<typeof schema.userProfiles>,
			"id" | "userId"
		> = {
			displayName: payload.displayName,
			displayId: payload.displayId,
			realName: payload.realName,
			realNameKana: payload.realNameKana,
			profileImageURL: payload.profileImageURL,
			academicEmail: payload.academicEmail,
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
			// とりあえず初期ユーザーはMEMBERにする
			this.client
				.insert(schema.userRoles)
				.values({
					userId: userId,
					roleId: ROLE_IDS.MEMBER,
				}),
		]);

		if (!res.success) {
			throw new Error("Failed to update user");
		}
	}

	async updateUser(userId: string, payload: Partial<Profile>): Promise<void> {
		const value: Omit<
			InferInsertModel<typeof schema.userProfiles>,
			"id" | "userId"
		> = {
			displayName: payload.displayName,
			displayId: payload.displayId,
			realName: payload.realName,
			realNameKana: payload.realNameKana,
			profileImageURL: payload.profileImageURL,
			academicEmail: payload.academicEmail,
			email: payload.email,
			studentId: payload.studentId,
			grade: payload.grade,
		};

		const res = await this.client
			.update(schema.userProfiles)
			.set(value)
			.where(eq(schema.userProfiles.userId, userId));

		if (!res.success) {
			throw new Error("Failed to update user");
		}
	}

	async fetchMembers(): Promise<Member[]> {
		const users = await this.client.query.users.findMany({
			with: {
				profile: true,
				roles: true,
			},
		});

		return users.map((user) => ({
			id: user.id,
			initialized: !!user.initializedAt,
			displayName: user.profile.displayName ?? undefined,
			realName: user.profile.realName ?? undefined,
			realNameKana: user.profile.realNameKana ?? undefined,
			displayId: user.profile.displayId ?? undefined,
			profileImageURL: user.profile.profileImageURL ?? undefined,
			grade: user.profile.grade ?? undefined,
			rolesIds: user.roles.map((role) => role.roleId),
		}));
	}

	async fetchMemberByDisplayId(displayId: string): Promise<Member> {
		const user = await this.client.query.userProfiles.findFirst({
			where: eq(schema.userProfiles.displayId, displayId),
			with: {
				user: {
					with: {
						roles: true,
					},
				},
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return {
			id: user.user.id,
			initialized: !!user.user.initializedAt,
			displayName: user.displayName ?? undefined,
			realName: user.realName ?? undefined,
			realNameKana: user.realNameKana ?? undefined,
			displayId: user.displayId ?? undefined,
			profileImageURL: user.profileImageURL ?? undefined,
			grade: user.grade ?? undefined,
			rolesIds: user.user.roles.map((role) => role.roleId),
		};
	}

	async fetchRolesByUserId(userId: string): Promise<number[]> {
		const roles = await this.client.query.userRoles.findMany({
			where: eq(schema.userRoles.userId, userId),
		});

		return roles.map((role) => role.roleId);
	}
}
