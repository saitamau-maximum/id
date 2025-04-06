import { type InferInsertModel, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { ROLE_BY_ID, ROLE_IDS } from "../../../constants/role";
import * as schema from "../../../db/schema";
import type {
	IUserRepository,
	Member,
	MemberWithCertifications,
	Profile,
	User,
	UserWithCertifications,
} from "./../../../repository/user";

export class CloudflareUserRepository implements IUserRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	private async createUserInternal(
		providerUserId: string,
		providerId: number,
		payload: Partial<Profile>,
		invitationId?: string,
	): Promise<string> {
		const userId = crypto.randomUUID();

		const { displayName, email, profileImageURL } = payload;
		const batchOps = [
			this.client.insert(schema.users).values({
				id: userId,
				...(invitationId && { invitationId }),
			}),
			this.client.insert(schema.oauthConnections).values({
				userId,
				providerId,
				providerUserId,
				email,
				name: displayName,
				profileImageUrl: profileImageURL,
			}),
			this.client.insert(schema.userProfiles).values({
				id: crypto.randomUUID(),
				userId,
				displayName,
				profileImageURL,
			}),
		] as const;

		const [_, res] = await this.client.batch(batchOps);

		if (res.success) {
			return userId;
		}

		throw new Error("Failed to create user");
	}

	async createUser(
		providerUserId: string,
		providerId: number,
		payload: Partial<Profile> = {},
	): Promise<string> {
		return this.createUserInternal(providerUserId, providerId, payload);
	}

	async createTemporaryUser(
		providerUserId: string,
		providerId: number,
		invitationId: string,
		payload: Partial<Profile> = {},
	): Promise<string> {
		return this.createUserInternal(
			providerUserId,
			providerId,
			payload,
			invitationId,
		);
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

	async fetchUserProfileById(userId: string): Promise<UserWithCertifications> {
		const user = await this.client.query.users.findFirst({
			where: eq(schema.users.id, userId),
			with: {
				roles: true,
				profile: true,
				certifications: {
					with: {
						certification: true,
					},
				},
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return {
			id: user.id,
			initialized: !!user.initializedAt,
			isProvisional: !!user.invitationId,
			displayName: user.profile.displayName ?? undefined,
			realName: user.profile.realName ?? undefined,
			realNameKana: user.profile.realNameKana ?? undefined,
			displayId: user.profile.displayId ?? undefined,
			profileImageURL: user.profile.profileImageURL ?? undefined,
			academicEmail: user.profile.academicEmail ?? undefined,
			email: user.profile.email ?? undefined,
			studentId: user.profile.studentId ?? undefined,
			grade: user.profile.grade ?? undefined,
			bio: user.profile.bio ?? undefined,
			roles: user.roles.map((role) => ROLE_BY_ID[role.roleId]),
			certifications: user.certifications.map((cert) => ({
				id: cert.certification.id,
				title: cert.certification.title,
				description: cert.certification.description,
				certifiedIn: cert.certifiedIn,
				isApproved: cert.isApproved,
			})),
			updatedAt: user.profile.updatedAt ?? undefined,
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
			updatedAt: new Date(),
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
				})
				// メンバー登録時に既にメンバーが付与されているケース（初期登録フローのやり直し）を考慮して、UNIQUE制約違反時は無視する
				.onConflictDoNothing(),
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
			bio: payload.bio,
			updatedAt: new Date(),
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
			isProvisional: !!user.invitationId,
			displayName: user.profile.displayName ?? undefined,
			realName: user.profile.realName ?? undefined,
			realNameKana: user.profile.realNameKana ?? undefined,
			displayId: user.profile.displayId ?? undefined,
			profileImageURL: user.profile.profileImageURL ?? undefined,
			grade: user.profile.grade ?? undefined,
			bio: user.profile.bio ?? undefined,
			roles: user.roles.map((role) => ROLE_BY_ID[role.roleId]),
		}));
	}

	async fetchMemberByDisplayId(
		displayId: string,
	): Promise<MemberWithCertifications> {
		const user = await this.client.query.userProfiles.findFirst({
			where: eq(schema.userProfiles.displayId, displayId),
			with: {
				user: {
					with: {
						roles: true,
						certifications: {
							with: {
								certification: true,
							},
						},
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
			isProvisional: !!user.user.invitationId,
			displayName: user.displayName ?? undefined,
			realName: user.realName ?? undefined,
			realNameKana: user.realNameKana ?? undefined,
			displayId: user.displayId ?? undefined,
			profileImageURL: user.profileImageURL ?? undefined,
			grade: user.grade ?? undefined,
			bio: user.bio ?? undefined,
			roles: user.user.roles.map((role) => ROLE_BY_ID[role.roleId]),
			certifications: user.user.certifications.map((cert) => ({
				id: cert.certification.id,
				title: cert.certification.title,
				description: cert.certification.description,
				certifiedIn: cert.certifiedIn,
				isApproved: cert.isApproved,
			})),
		};
	}

	async fetchRolesByUserId(userId: string): Promise<number[]> {
		const roles = await this.client.query.userRoles.findMany({
			where: eq(schema.userRoles.userId, userId),
		});

		return roles.map((role) => role.roleId);
	}

	async fetchAllUsers(): Promise<User[]> {
		const users = await this.client.query.users.findMany({
			with: {
				roles: true,
				profile: true,
			},
		});

		return users.map((user) => ({
			id: user.id,
			initialized: !!user.initializedAt,
			isProvisional: !!user.invitationId,
			displayName: user.profile.displayName ?? undefined,
			realName: user.profile.realName ?? undefined,
			realNameKana: user.profile.realNameKana ?? undefined,
			displayId: user.profile.displayId ?? undefined,
			profileImageURL: user.profile.profileImageURL ?? undefined,
			academicEmail: user.profile.academicEmail ?? undefined,
			email: user.profile.email ?? undefined,
			studentId: user.profile.studentId ?? undefined,
			grade: user.profile.grade ?? undefined,
			roles: user.roles.map((role) => ROLE_BY_ID[role.roleId]),
			bio: user.profile.bio ?? undefined,
			updatedAt: user.profile.updatedAt ?? undefined,
		}));
	}

	async updateUserRole(userId: string, roleIds: number[]): Promise<void> {
		const res = await this.client
			.delete(schema.userRoles)
			.where(eq(schema.userRoles.userId, userId));

		if (!res.success) {
			throw new Error("Failed to update user role");
		}

		const values = roleIds.map((roleId) => ({
			userId,
			roleId,
		}));

		const res2 = await this.client.insert(schema.userRoles).values(values);

		if (!res2.success) {
			throw new Error("Failed to update user role");
		}
	}
}
