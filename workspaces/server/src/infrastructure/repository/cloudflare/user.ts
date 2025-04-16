import type { Member } from "@idp/schema/entity/member";
import type { User, UserProfile } from "@idp/schema/entity/user";
import { type InferInsertModel, eq, isNotNull, isNull } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { ROLE_BY_ID, ROLE_IDS } from "../../../constants/role";
import * as schema from "../../../db/schema";
import type {
	CreateUserPayload,
	FetchApprovedUsersRes,
	FetchMembersRes,
	FetchProvisionalUsersRes,
	IUserRepository,
	RegisterUserPayload,
	UpdateUserPayload,
} from "./../../../repository/user";

export class CloudflareUserRepository implements IUserRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	private async createUserInternal(
		providerUserId: string,
		providerId: number,
		payload: Partial<UserProfile>,
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
		payload: CreateUserPayload = {},
	): Promise<string> {
		return this.createUserInternal(providerUserId, providerId, payload);
	}

	async createTemporaryUser(
		providerUserId: string,
		providerId: number,
		invitationId: string,
		payload: CreateUserPayload = {},
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

	async fetchUserProfileById(userId: string): Promise<User> {
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
				socialLinks: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return {
			id: user.id,
			initializedAt: user.initializedAt,
			isProvisional: !!user.invitationId,
			lastPaymentConfirmedAt: user.lastPaymentConfirmedAt,
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
			socialLinks: user.socialLinks.map((link) => link.url),
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

	async registerUser(
		userId: string,
		payload: RegisterUserPayload,
	): Promise<void> {
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

	async updateUser(userId: string, payload: UpdateUserPayload): Promise<void> {
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

		try {
			await this.client
				.update(schema.userProfiles)
				.set(value)
				.where(eq(schema.userProfiles.userId, userId));

			if (payload.socialLinks) {
				await this.client
					.delete(schema.socialLinks)
					.where(eq(schema.socialLinks.userId, userId));

				await this.client.insert(schema.socialLinks).values(
					payload.socialLinks.map((link) => ({
						userId,
						url: link,
					})),
				);
			}
		} catch (err) {
			throw new Error("Failed to update user");
		}
	}

	async fetchMembers(): Promise<FetchMembersRes> {
		const users = await this.client.query.users.findMany({
			where: isNull(schema.users.invitationId),
			with: {
				profile: true,
				roles: true,
			},
		});

		// メンバーのみを取得
		// TODO: SQLでフィルタする
		const members = users.filter((user) =>
			user.roles.some((role) => role.roleId === ROLE_IDS.MEMBER),
		);

		return members.map((user) => ({
			id: user.id,
			initializedAt: user.initializedAt,
			isProvisional: !!user.invitationId,
			lastPaymentConfirmedAt: user.lastPaymentConfirmedAt,
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

	async fetchMemberByDisplayId(displayId: string): Promise<Member> {
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
						socialLinks: true,
					},
				},
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return {
			id: user.user.id,
			displayName: user.displayName ?? undefined,
			realName: user.realName ?? undefined,
			realNameKana: user.realNameKana ?? undefined,
			displayId: user.displayId ?? undefined,
			profileImageURL: user.profileImageURL ?? undefined,
			grade: user.grade ?? undefined,
			bio: user.bio ?? undefined,
			roles: user.user.roles.map((role) => ROLE_BY_ID[role.roleId]),
			socialLinks: user.user.socialLinks.map((link) => link.url),
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

	async fetchApprovedUsers(): Promise<FetchApprovedUsersRes> {
		const users = await this.client.query.users.findMany({
			where: isNull(schema.users.invitationId),
			with: {
				profile: true,
				roles: true,
			},
		});

		return users.map((user) => ({
			id: user.id,
			initializedAt: user.initializedAt,
			isProvisional: !!user.invitationId,
			lastPaymentConfirmedAt: user.lastPaymentConfirmedAt,
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

	async addUserRole(userId: string, roleId: number): Promise<void> {
		const res = await this.client
			.insert(schema.userRoles)
			.values({
				userId,
				roleId,
			})
			.onConflictDoNothing();

		if (!res.success) {
			throw new Error("Failed to add user role");
		}
	}

	async fetchProvisionalUsers(): Promise<FetchProvisionalUsersRes> {
		const users = await this.client.query.users.findMany({
			where: isNotNull(schema.users.invitationId),
			with: {
				profile: true,
				roles: true,
				invitation: true,
			},
		});

		return users.map((user) => ({
			id: user.id,
			initializedAt: user.initializedAt,
			isProvisional: !!user.invitationId,
			lastPaymentConfirmedAt: user.lastPaymentConfirmedAt,
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
			invitationTitle: user.invitation?.title ?? undefined,
			invitationId: user.invitation?.id ?? undefined,
		}));
	}

	async approveProvisionalUser(userId: string): Promise<void> {
		const res = await this.client
			.update(schema.users)
			.set({
				invitationId: null,
				lastPaymentConfirmedAt: new Date(),
			})
			.where(eq(schema.users.id, userId));

		if (!res.success) {
			throw new Error("Failed to approve user");
		}

		// 仮実装でMEMBERロールを付与
		await this.addUserRole(userId, ROLE_IDS.MEMBER);
	}

	async confirmPayment(userId: string): Promise<void> {
		const res = await this.client
			.update(schema.users)
			.set({
				lastPaymentConfirmedAt: new Date(),
			})
			.where(eq(schema.users.id, userId));

		if (!res.success) {
			throw new Error("Failed to confirm payment");
		}

		await this.addUserRole(userId, ROLE_IDS.MEMBER);
	}

	async rejectProvisionalUser(userId: string): Promise<void> {
		const res = await this.client
			.delete(schema.users)
			.where(eq(schema.users.id, userId));

		if (!res.success) {
			throw new Error("Failed to reject user");
		}
	}
}
