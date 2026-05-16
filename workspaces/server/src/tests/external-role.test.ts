import { env } from "cloudflare:test";
import { OAUTH_PROVIDER_IDS } from "@idp/schema/entity/oauth-internal/oauth-provider";
import { ROLE_IDS } from "@idp/schema/entity/role";
import { beforeEach, describe, expect, it } from "vitest";
import { CloudflareExternalRoleRepository } from "../infrastructure/repository/cloudflare/external-role";
import { CloudflareExternalRoleConditionRepository } from "../infrastructure/repository/cloudflare/external-role-condition";

const clearTables = async () => {
	await env.DB.exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM external_role_grant_conditions;
    DELETE FROM external_roles;
    PRAGMA foreign_keys = ON;
  `);
};

describe("CloudflareExternalRoleRepository", () => {
	beforeEach(async () => {
		await clearTables();
	});

	const fetchedAt = new Date("2026-01-01T00:00:00.000Z");

	it("replaceProviderRoles inserts new rows when table is empty", async () => {
		const repo = new CloudflareExternalRoleRepository(env.DB);

		const result = await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[
				{ externalRoleId: "dev", name: "Developers" },
				{ externalRoleId: "core", name: "Core" },
			],
			fetchedAt,
		);

		expect(result).toHaveLength(2);
		expect(result.map((r) => r.externalRoleId).sort()).toEqual(["core", "dev"]);
		expect(
			result.every((r) => r.providerId === OAUTH_PROVIDER_IDS.GITHUB),
		).toBe(true);
		expect(
			result.every((r) => r.lastFetchedAt.getTime() === fetchedAt.getTime()),
		).toBe(true);
	});

	it("replaceProviderRoles updates name and lastFetchedAt on existing rows", async () => {
		const repo = new CloudflareExternalRoleRepository(env.DB);

		await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[{ externalRoleId: "dev", name: "Developers" }],
			fetchedAt,
		);

		const later = new Date("2026-02-01T00:00:00.000Z");
		const result = await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[{ externalRoleId: "dev", name: "Developers (renamed)" }],
			later,
		);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("Developers (renamed)");
		expect(result[0].lastFetchedAt.getTime()).toBe(later.getTime());
	});

	it("replaceProviderRoles deletes rows missing from the new list", async () => {
		const repo = new CloudflareExternalRoleRepository(env.DB);

		await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[
				{ externalRoleId: "dev", name: "Developers" },
				{ externalRoleId: "core", name: "Core" },
			],
			fetchedAt,
		);

		await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[{ externalRoleId: "dev", name: "Developers" }],
			fetchedAt,
		);

		const all = await repo.listByProvider(OAUTH_PROVIDER_IDS.GITHUB);
		expect(all.map((r) => r.externalRoleId)).toEqual(["dev"]);
	});

	it("replaceProviderRoles with empty list deletes all rows of the provider", async () => {
		const repo = new CloudflareExternalRoleRepository(env.DB);

		await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[{ externalRoleId: "dev", name: "Developers" }],
			fetchedAt,
		);

		const result = await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[],
			fetchedAt,
		);

		expect(result).toEqual([]);
		expect(await repo.listByProvider(OAUTH_PROVIDER_IDS.GITHUB)).toEqual([]);
	});

	it("replaceProviderRoles does not affect other providers", async () => {
		const repo = new CloudflareExternalRoleRepository(env.DB);

		await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[{ externalRoleId: "dev", name: "Developers" }],
			fetchedAt,
		);
		await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.DISCORD,
			[{ externalRoleId: "111111111111", name: "運営" }],
			fetchedAt,
		);

		// GitHub だけ全削除
		await repo.replaceProviderRoles(OAUTH_PROVIDER_IDS.GITHUB, [], fetchedAt);

		expect(await repo.listByProvider(OAUTH_PROVIDER_IDS.GITHUB)).toEqual([]);
		const discordRoles = await repo.listByProvider(OAUTH_PROVIDER_IDS.DISCORD);
		expect(discordRoles).toHaveLength(1);
		expect(discordRoles[0].externalRoleId).toBe("111111111111");
	});

	it("listAll returns rows from all providers", async () => {
		const repo = new CloudflareExternalRoleRepository(env.DB);

		await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[{ externalRoleId: "dev", name: "Developers" }],
			fetchedAt,
		);
		await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.DISCORD,
			[{ externalRoleId: "111", name: "運営" }],
			fetchedAt,
		);

		const all = await repo.listAll();
		expect(all).toHaveLength(2);
	});

	it("getById returns the row or null", async () => {
		const repo = new CloudflareExternalRoleRepository(env.DB);

		const [inserted] = await repo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[{ externalRoleId: "dev", name: "Developers" }],
			fetchedAt,
		);

		const fetched = await repo.getById(inserted.id);
		expect(fetched?.externalRoleId).toBe("dev");
		expect(await repo.getById(99999)).toBeNull();
	});
});

describe("CloudflareExternalRoleConditionRepository", () => {
	beforeEach(async () => {
		await clearTables();
	});

	const seed = async () => {
		const roleRepo = new CloudflareExternalRoleRepository(env.DB);
		const [row] = await roleRepo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.DISCORD,
			[{ externalRoleId: "111", name: "運営" }],
			new Date(),
		);
		return row;
	};

	it("setForExternalRole inserts new conditions", async () => {
		const externalRole = await seed();
		const condRepo = new CloudflareExternalRoleConditionRepository(env.DB);

		await condRepo.setForExternalRole(externalRole.id, [
			ROLE_IDS.ADMIN,
			ROLE_IDS.PR,
		]);

		const rows = await condRepo.listByExternalRoleId(externalRole.id);
		expect(rows.map((r) => r.requiredRoleId).sort()).toEqual(
			[ROLE_IDS.ADMIN, ROLE_IDS.PR].sort(),
		);
	});

	it("setForExternalRole replaces existing conditions", async () => {
		const externalRole = await seed();
		const condRepo = new CloudflareExternalRoleConditionRepository(env.DB);

		await condRepo.setForExternalRole(externalRole.id, [
			ROLE_IDS.ADMIN,
			ROLE_IDS.PR,
		]);
		await condRepo.setForExternalRole(externalRole.id, [ROLE_IDS.ACCOUNTANT]);

		const rows = await condRepo.listByExternalRoleId(externalRole.id);
		expect(rows.map((r) => r.requiredRoleId)).toEqual([ROLE_IDS.ACCOUNTANT]);
	});

	it("setForExternalRole with empty list clears conditions", async () => {
		const externalRole = await seed();
		const condRepo = new CloudflareExternalRoleConditionRepository(env.DB);

		await condRepo.setForExternalRole(externalRole.id, [ROLE_IDS.ADMIN]);
		await condRepo.setForExternalRole(externalRole.id, []);

		expect(await condRepo.listByExternalRoleId(externalRole.id)).toEqual([]);
	});

	it("setForExternalRole dedupes input", async () => {
		const externalRole = await seed();
		const condRepo = new CloudflareExternalRoleConditionRepository(env.DB);

		await condRepo.setForExternalRole(externalRole.id, [
			ROLE_IDS.ADMIN,
			ROLE_IDS.ADMIN,
			ROLE_IDS.PR,
		]);

		const rows = await condRepo.listByExternalRoleId(externalRole.id);
		expect(rows).toHaveLength(2);
	});

	it("deleting an external_role cascades to conditions", async () => {
		const externalRole = await seed();
		const condRepo = new CloudflareExternalRoleConditionRepository(env.DB);
		const roleRepo = new CloudflareExternalRoleRepository(env.DB);

		await condRepo.setForExternalRole(externalRole.id, [ROLE_IDS.ADMIN]);
		await roleRepo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.DISCORD,
			[],
			new Date(),
		);

		expect(await condRepo.listAll()).toEqual([]);
	});

	it("listAll returns conditions across external roles", async () => {
		const roleRepo = new CloudflareExternalRoleRepository(env.DB);
		const [a] = await roleRepo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.DISCORD,
			[{ externalRoleId: "111", name: "運営" }],
			new Date(),
		);
		const [b] = await roleRepo.replaceProviderRoles(
			OAUTH_PROVIDER_IDS.GITHUB,
			[{ externalRoleId: "dev", name: "Developers" }],
			new Date(),
		);

		const condRepo = new CloudflareExternalRoleConditionRepository(env.DB);
		await condRepo.setForExternalRole(a.id, [ROLE_IDS.ADMIN]);
		await condRepo.setForExternalRole(b.id, [ROLE_IDS.DEV, ROLE_IDS.MEMBER]);

		const all = await condRepo.listAll();
		expect(all).toHaveLength(3);
	});
});
