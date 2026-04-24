import { env } from "cloudflare:test";
import { ROLE_IDS, type RoleId } from "@idp/schema/entity/role";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "../db/schema";
import { CloudflareUserRepository } from "../infrastructure/repository/cloudflare/user";

const userRepository = new CloudflareUserRepository(env.DB);
const db = drizzle(env.DB, { schema });

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

describe.sequential("CloudflareUserRepository.removeMemberRoleFromUsersBefore", () => {
	beforeEach(async () => {
		await clearDatabase();
	});

	it("removes only MEMBER from users before the cutoff or with null payment date, and returns the removed count", async () => {
		const cutoff = new Date("2025-04-01T00:00:00.000Z");

		const expiredUserId = await createUserWithRoles(
			new Date("2025-03-31T23:59:59.000Z"),
			[ROLE_IDS.MEMBER, ROLE_IDS.DEV],
		);
		const nullPaymentUserId = await createUserWithRoles(null, [
			ROLE_IDS.MEMBER,
			ROLE_IDS.PR,
		]);
		const currentUserId = await createUserWithRoles(
			new Date("2025-04-01T00:00:01.000Z"),
			[ROLE_IDS.MEMBER, ROLE_IDS.CP],
		);
		const boundaryUserId = await createUserWithRoles(cutoff, [ROLE_IDS.MEMBER]);
		const nonMemberUserId = await createUserWithRoles(
			new Date("2025-03-01T00:00:00.000Z"),
			[ROLE_IDS.ADMIN],
		);

		const deletedCount =
			await userRepository.removeMemberRoleFromUsersBefore(cutoff);

		expect(deletedCount).toBe(2);
		await expect(
			userRepository.fetchRolesByUserId(expiredUserId),
		).resolves.toEqual([ROLE_IDS.DEV]);
		await expect(
			userRepository.fetchRolesByUserId(nullPaymentUserId),
		).resolves.toEqual([ROLE_IDS.PR]);
		await expect(
			userRepository.fetchRolesByUserId(currentUserId),
		).resolves.toEqual([ROLE_IDS.MEMBER, ROLE_IDS.CP]);
		await expect(
			userRepository.fetchRolesByUserId(boundaryUserId),
		).resolves.toEqual([ROLE_IDS.MEMBER]);
		await expect(
			userRepository.fetchRolesByUserId(nonMemberUserId),
		).resolves.toEqual([ROLE_IDS.ADMIN]);
	});

	it("returns 0 when no MEMBER user matches the cutoff", async () => {
		const cutoff = new Date("2025-04-01T00:00:00.000Z");

		const currentUserId = await createUserWithRoles(
			new Date("2025-04-02T00:00:00.000Z"),
			[ROLE_IDS.MEMBER, ROLE_IDS.WEB],
		);
		const boundaryUserId = await createUserWithRoles(cutoff, [ROLE_IDS.MEMBER]);
		const nonMemberUserId = await createUserWithRoles(
			new Date("2025-03-01T00:00:00.000Z"),
			[ROLE_IDS.ACCOUNTANT],
		);

		const deletedCount =
			await userRepository.removeMemberRoleFromUsersBefore(cutoff);

		expect(deletedCount).toBe(0);
		await expect(
			userRepository.fetchRolesByUserId(currentUserId),
		).resolves.toEqual([ROLE_IDS.MEMBER, ROLE_IDS.WEB]);
		await expect(
			userRepository.fetchRolesByUserId(boundaryUserId),
		).resolves.toEqual([ROLE_IDS.MEMBER]);
		await expect(
			userRepository.fetchRolesByUserId(nonMemberUserId),
		).resolves.toEqual([ROLE_IDS.ACCOUNTANT]);
	});
});
