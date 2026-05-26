/**
 * external_role_conditions / external_role_condition_requirements に
 * conditions.ts の定義を idempotent に注入する。
 *
 * Usage:
 *   pnpm -C workspaces/server run inject:conditions:local
 *   pnpm -C workspaces/server run inject:conditions:preview
 *   pnpm -C workspaces/server run inject:conditions:prod
 */
import { execSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONDITIONS } from "../src/external-role-sync/conditions.ts";

type Env = "local" | "preview" | "production";

const ENV_CONFIG: Record<Env, { dbName: string; wranglerFlags: string }> = {
	local: {
		dbName: "idp-db-local",
		wranglerFlags: "--local",
	},
	preview: {
		dbName: "idp-db-preview",
		wranglerFlags: "--env preview --remote",
	},
	production: {
		dbName: "idp-db",
		wranglerFlags: "--env production --remote",
	},
};

const computeSignature = (sortedRoleIds: number[]): string =>
	sortedRoleIds.join(",");

const escapeSql = (s: string): string => s.replace(/'/g, "''");

function generateSql(): string {
	const lines: string[] = ["BEGIN TRANSACTION;", ""];

	for (const cond of CONDITIONS) {
		const sorted = [...cond.requiredRoleIds].sort((a, b) => a - b);
		const signature = computeSignature(sorted);
		const roleLabel =
			sorted.length === 0 ? "(all users)" : sorted.join(" AND ");

		lines.push(
			`-- provider=${cond.providerId} externalRoleId=${cond.externalRoleId} requiredRoles=[${roleLabel}]`,
		);
		lines.push(
			`INSERT OR IGNORE INTO external_role_conditions (provider_id, external_role_id, requirement_count, requirement_signature)`,
		);
		lines.push(
			`  VALUES (${cond.providerId}, '${escapeSql(cond.externalRoleId)}', ${sorted.length}, '${escapeSql(signature)}');`,
		);

		for (const roleId of sorted) {
			lines.push(
				`INSERT OR IGNORE INTO external_role_condition_requirements (condition_id, required_role_id)`,
			);
			lines.push(
				`  SELECT id, ${roleId} FROM external_role_conditions WHERE provider_id = ${cond.providerId} AND external_role_id = '${escapeSql(cond.externalRoleId)}' AND requirement_signature = '${escapeSql(signature)}';`,
			);
		}
		lines.push("");
	}

	lines.push("COMMIT;");
	return lines.join("\n");
}

function main() {
	const envArg = process.argv[2] as Env | undefined;
	if (!envArg || !(envArg in ENV_CONFIG)) {
		console.error(
			`Usage: inject-conditions.ts <local|preview|production>\nGot: ${envArg}`,
		);
		process.exit(1);
	}

	const { dbName, wranglerFlags } = ENV_CONFIG[envArg];
	const sql = generateSql();

	console.log(
		`=== ${CONDITIONS.length} condition(s) to inject into [${envArg}] ===`,
	);
	console.log(sql);

	const tmpFile = join(tmpdir(), `idp-conditions-${Date.now()}.sql`);
	writeFileSync(tmpFile, sql, "utf-8");

	try {
		execSync(
			`wrangler d1 execute ${dbName} ${wranglerFlags} --file ${tmpFile}`,
			{ stdio: "inherit", cwd: new URL("..", import.meta.url).pathname },
		);
		console.log("Done.");
	} finally {
		unlinkSync(tmpFile);
	}
}

main();
