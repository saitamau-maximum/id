import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { ROLE_BY_ID, ROLE_IDS } from "../../constants/role";
import { factory } from "../../factory";
import {
	authMiddleware,
	roleAuthorizationMiddleware,
} from "../../middleware/auth";

const app = factory.createApp();

const UpdateRoleRequestSchema = v.object({
	roleIds: v.array(v.number()),
});

const route = app
	.use(authMiddleware)
	.use(
		roleAuthorizationMiddleware({
			ALLOWED_ROLES: [ROLE_IDS.ADMIN],
		}),
	)
	.get("/list", async (c) => {
		const { UserRepository } = c.var;
		try {
			const users = await UserRepository.fetchAllUsers();
			return c.json(users);
		} catch (e) {
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.put(
		"/:userId/role",
		vValidator("json", UpdateRoleRequestSchema),
		async (c) => {
			const userId = c.req.param("userId");
			const { UserRepository } = c.var;
			const { roleIds } = c.req.valid("json");

			// 存在しないロールIDが含まれている場合はエラー
			if (roleIds.some((roleId) => !ROLE_BY_ID[roleId])) {
				return c.json({ error: "Invalid Role ID" }, 400);
			}

			try {
				await UserRepository.updateUserRole(userId, roleIds);
				return c.text("ok", 200);
			} catch (e) {
				return c.json({ error: "Internal Server Error" }, 500);
			}
		},
	);

export { route as adminUsersRoute };
