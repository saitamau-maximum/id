import { and, eq, inArray } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import prompts from "prompts";
import { ROLE_BY_ID } from "../../../constants/role";
import * as schema from "../../../db/schema";
import { getUserFromDisplayIdPrompt } from "./common/get-user-from-display-id-prompt";

export const editUserRole = async (
	client: DrizzleD1Database<typeof schema>,
) => {
	const user = await getUserFromDisplayIdPrompt(client);
	if (!user) return;

	const userRoles = await client.query.userRoles.findMany({
		where: (role, { eq }) => eq(role.userId, user.userId),
	});

	const userRoleIds = new Set(userRoles.map((role) => role.roleId));

	const res = await prompts(
		{
			type: "multiselect",
			name: "roleIds",
			message: "ユーザーのロールを選択してください",
			choices: Object.entries(ROLE_BY_ID).map(([roleId, role]) => ({
				title: role.name,
				value: Number.parseInt(roleId),
				selected: userRoleIds.has(Number.parseInt(roleId)),
			})),
		},
		{
			onCancel() {
				console.error("Prompt canceled");
				process.exit(1);
			},
		},
	);

	const roleIds = res.roleIds as number[];
	const newRoleIds = roleIds.filter((roleId) => !userRoleIds.has(roleId));
	const deleteRoleIds = Array.from(userRoleIds).filter(
		(roleId) => !roleIds.includes(roleId),
	);

	await client.insert(schema.userRoles).values(
		newRoleIds.map((roleId) => ({
			userId: user.userId,
			roleId,
		})),
	);

	await client
		.delete(schema.userRoles)
		.where(
			and(
				eq(schema.userRoles.userId, user.userId),
				inArray(schema.userRoles.roleId, deleteRoleIds),
			),
		);
};
