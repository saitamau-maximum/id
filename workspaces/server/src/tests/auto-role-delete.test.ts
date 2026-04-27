import { env } from "cloudflare:test";
import { ROLE_IDS, type RoleId } from "@idp/schema/entity/role";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "../db/schema";
import { CloudflareUserRepository } from "../infrastructure/repository/cloudflare/user";

const clearDatabase = async () => {
	await env.DB.exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM oauth_token_scopes;
    DELETE FROM oauth_tokens;
    DELETE FROM oauth_client_scopes;
    DELETE FROM oauth_client_callbacks;
    DELETE FROM oauth_client_secrets;
    DELETE FROM oauth_client_managers;
    DELETE FROM oauth_clients;
    DELETE FROM oauth_connections;
    DELETE FROM social_links;
    DELETE FROM calendar_events;
    DELETE FROM invite_roles;
    DELETE FROM user_certifications;
    DELETE FROM equipments;
    UPDATE users SET invitation_id = NULL;
    DELETE FROM user_roles;
    DELETE FROM user_profiles;
    DELETE FROM invites;
    DELETE FROM certifications;
    DELETE FROM locations;
    DELETE FROM users;
    PRAGMA foreign_keys = ON;
  `);
};

const createUserWithRoles = async (
	userRepository: CloudflareUserRepository,
	db: ReturnType<typeof drizzle>,
	lastPaymentConfirmedAt: Date | null,
	roleIds: RoleId[],
) => {
	const userId = await userRepository.createUser({});

	if (lastPaymentConfirmedAt !== null) {
		await db
			.update(schema.users)
			.set({ lastPaymentConfirmedAt })
			.where(eq(schema.users.id, userId));
	}

	for (const roleId of roleIds) {
		await userRepository.addUserRole(userId, roleId);
	}

	return userId;
};

describe("CloudflareUserRepository.removeMemberRoleFromUsersBefore", () => {
	const cutoff = new Date("2025-03-31T15:00:00.000Z");

	beforeEach(async () => {
		await clearDatabase();
	});

	it("removes MEMBER role from user before cutoff", async () => {
		const userRepository = new CloudflareUserRepository(env.DB);
		const db = drizzle(env.DB, { schema });

		const expiredUserId = await createUserWithRoles(
			userRepository,
			db,
			new Date("2025-03-31T14:59:59.000Z"),
			[ROLE_IDS.MEMBER, ROLE_IDS.DEV],
		);

		const deletedCount =
			await userRepository.removeMemberRoleFromUsersBefore(cutoff);

		expect(deletedCount).toBe(1);
		expect(await userRepository.fetchRolesByUserId(expiredUserId)).toEqual([
			ROLE_IDS.DEV,
		]);
	});

	it("removes MEMBER role when payment date is null", async () => {
		const userRepository = new CloudflareUserRepository(env.DB);
		const db = drizzle(env.DB, { schema });

		const nullPaymentUserId = await createUserWithRoles(
			userRepository,
			db,
			null,
			[ROLE_IDS.MEMBER, ROLE_IDS.PR],
		);

		const deletedCount =
			await userRepository.removeMemberRoleFromUsersBefore(cutoff);

		expect(deletedCount).toBe(1);
		expect(await userRepository.fetchRolesByUserId(nullPaymentUserId)).toEqual([
			ROLE_IDS.PR,
		]);
	});

	it("does not remove MEMBER role from user after cutoff", async () => {
		const userRepository = new CloudflareUserRepository(env.DB);
		const db = drizzle(env.DB, { schema });

		const currentUserId = await createUserWithRoles(
			userRepository,
			db,
			new Date("2025-03-31T15:00:01.000Z"),
			[ROLE_IDS.MEMBER, ROLE_IDS.CP],
		);

		const deletedCount =
			await userRepository.removeMemberRoleFromUsersBefore(cutoff);

		expect(deletedCount).toBe(0);
		expect(await userRepository.fetchRolesByUserId(currentUserId)).toEqual([
			ROLE_IDS.MEMBER,
			ROLE_IDS.CP,
		]);
	});

	it("does not remove MEMBER role at cutoff boundary", async () => {
		const userRepository = new CloudflareUserRepository(env.DB);
		const db = drizzle(env.DB, { schema });

		const boundaryUserId = await createUserWithRoles(
			userRepository,
			db,
			cutoff,
			[ROLE_IDS.MEMBER],
		);

		const deletedCount =
			await userRepository.removeMemberRoleFromUsersBefore(cutoff);

		expect(deletedCount).toBe(0);
		expect(await userRepository.fetchRolesByUserId(boundaryUserId)).toEqual([
			ROLE_IDS.MEMBER,
		]);
	});

	it("does not affect users without MEMBER role", async () => {
		const userRepository = new CloudflareUserRepository(env.DB);
		const db = drizzle(env.DB, { schema });

		const nonMemberUserId = await createUserWithRoles(
			userRepository,
			db,
			new Date("2025-03-01T00:00:00.000Z"),
			[ROLE_IDS.ADMIN],
		);

		const deletedCount =
			await userRepository.removeMemberRoleFromUsersBefore(cutoff);

		expect(deletedCount).toBe(0);
		expect(await userRepository.fetchRolesByUserId(nonMemberUserId)).toEqual([
			ROLE_IDS.ADMIN,
		]);
	});
});
