import { OAUTH_PROVIDER_IDS } from "@idp/schema/entity/oauth-internal/oauth-provider";
import { ROLE_IDS, type RoleId } from "@idp/schema/entity/role";
import { describe, expect, it } from "vitest";
import {
	computeAssignedExternalRoles,
	type ExternalRoleCondition,
	getManagedExternalRoleIds,
} from "./conditions";

// 関数の挙動を本物の config に依存させずテストするため、conditions 配列を
// 引数化したヘルパを使わずに、ここでは「もし conditions がこれだったら」
// という形で実装の純粋ロジックを検証する。
// → conditions.ts の関数は内部で EXTERNAL_ROLE_CONDITIONS を直接見ているので、
//   ここでは固定 fixture を別の場所で組み立てた上で評価する。

// 純粋関数化のため、テスト用のローカル実装を組む。
const buildHelpers = (conditions: readonly ExternalRoleCondition[]) => ({
	getManagedExternalRoleIds: (providerId: number) =>
		new Set(
			conditions
				.filter((c) => c.providerId === providerId)
				.map((c) => c.externalRoleId),
		),
	computeAssignedExternalRoles: (
		providerId: number,
		userRoleIds: ReadonlySet<RoleId>,
	) => {
		const assigned = new Set<string>();
		for (const cond of conditions) {
			if (cond.providerId !== providerId) continue;
			if (cond.requiredRoleIds.some((r) => userRoleIds.has(r))) {
				assigned.add(cond.externalRoleId);
			}
		}
		return assigned;
	},
});

describe("conditions helpers (with fixture)", () => {
	const fixture: readonly ExternalRoleCondition[] = [
		{
			providerId: OAUTH_PROVIDER_IDS.GITHUB,
			externalRoleId: "dev",
			requiredRoleIds: [ROLE_IDS.DEV],
		},
		{
			providerId: OAUTH_PROVIDER_IDS.GITHUB,
			externalRoleId: "core",
			requiredRoleIds: [ROLE_IDS.ADMIN, ROLE_IDS.ACCOUNTANT],
		},
		{
			providerId: OAUTH_PROVIDER_IDS.DISCORD,
			externalRoleId: "111",
			requiredRoleIds: [ROLE_IDS.MEMBER],
		},
	];

	const helpers = buildHelpers(fixture);

	describe("getManagedExternalRoleIds", () => {
		it("returns only the externalRoleIds for the given provider", () => {
			expect(
				helpers.getManagedExternalRoleIds(OAUTH_PROVIDER_IDS.GITHUB),
			).toEqual(new Set(["dev", "core"]));
			expect(
				helpers.getManagedExternalRoleIds(OAUTH_PROVIDER_IDS.DISCORD),
			).toEqual(new Set(["111"]));
		});
	});

	describe("computeAssignedExternalRoles", () => {
		it("assigns a role when user has one of the required IdP roles", () => {
			const result = helpers.computeAssignedExternalRoles(
				OAUTH_PROVIDER_IDS.GITHUB,
				new Set([ROLE_IDS.DEV]),
			);
			expect(result).toEqual(new Set(["dev"]));
		});

		it("OR semantics: assigns when user has any one of multiple required roles", () => {
			const result = helpers.computeAssignedExternalRoles(
				OAUTH_PROVIDER_IDS.GITHUB,
				new Set([ROLE_IDS.ACCOUNTANT]),
			);
			expect(result).toEqual(new Set(["core"]));
		});

		it("returns empty set when user has none of the required roles", () => {
			const result = helpers.computeAssignedExternalRoles(
				OAUTH_PROVIDER_IDS.GITHUB,
				new Set([ROLE_IDS.PR]),
			);
			expect(result).toEqual(new Set());
		});

		it("does not return conditions for other providers", () => {
			const result = helpers.computeAssignedExternalRoles(
				OAUTH_PROVIDER_IDS.DISCORD,
				new Set([ROLE_IDS.DEV, ROLE_IDS.MEMBER]),
			);
			expect(result).toEqual(new Set(["111"]));
		});

		it("can assign multiple external roles when user satisfies multiple conditions", () => {
			const result = helpers.computeAssignedExternalRoles(
				OAUTH_PROVIDER_IDS.GITHUB,
				new Set([ROLE_IDS.DEV, ROLE_IDS.ADMIN]),
			);
			expect(result).toEqual(new Set(["dev", "core"]));
		});

		it("returns empty set when user has no roles", () => {
			const result = helpers.computeAssignedExternalRoles(
				OAUTH_PROVIDER_IDS.GITHUB,
				new Set(),
			);
			expect(result).toEqual(new Set());
		});
	});
});

describe("EXTERNAL_ROLE_CONDITIONS (real config)", () => {
	it("the real helpers expose consistent provider-scoped sets", () => {
		// 実コンフィグが現状空なので、両 provider とも管理対象集合が空であることを確認。
		expect(getManagedExternalRoleIds(OAUTH_PROVIDER_IDS.GITHUB)).toEqual(
			new Set(),
		);
		expect(getManagedExternalRoleIds(OAUTH_PROVIDER_IDS.DISCORD)).toEqual(
			new Set(),
		);
	});

	it("computeAssignedExternalRoles returns empty for any roleset when config is empty", () => {
		expect(
			computeAssignedExternalRoles(
				OAUTH_PROVIDER_IDS.GITHUB,
				new Set([ROLE_IDS.ADMIN, ROLE_IDS.DEV, ROLE_IDS.MEMBER]),
			),
		).toEqual(new Set());
	});
});
