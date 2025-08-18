import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { OAUTH_PROVIDER_IDS } from "../../constants/oauth";
import { ROLE_BY_ID } from "../../constants/role";
import { factory } from "../../factory";
import {
	adminOnlyMiddleware,
	invitesMutableMiddleware,
} from "../../middleware/auth";

const app = factory.createApp();

const UpdateRoleRequestSchema = v.object({
	roleIds: v.array(v.number()),
});

const route = app
	.use(invitesMutableMiddleware)
	.get("/list", async (c) => {
		const { UserRepository } = c.var;
		const users = await UserRepository.fetchApprovedUsers();
		return c.json(users);
	})
	.put(
		"/:userId/role",
		adminOnlyMiddleware,
		vValidator("json", UpdateRoleRequestSchema),
		async (c) => {
			const userId = c.req.param("userId");
			const { UserRepository } = c.var;
			const { roleIds } = c.req.valid("json");

			// 存在しないロールIDが含まれている場合はエラー
			if (roleIds.some((roleId) => !ROLE_BY_ID[roleId])) {
				return c.json({ error: "Invalid Role ID" }, 400);
			}

			// ユーザーが存在するか確認
			const user = await UserRepository.fetchUserProfileById(userId).catch(
				() => null,
			);
			if (!user) {
				return c.body(null, 404);
			}

			await UserRepository.updateUserRole(userId, roleIds);
			return c.body(null, 204);
		},
	)
	.get("/provisional", async (c) => {
		const { UserRepository } = c.var;
		const users = await UserRepository.fetchProvisionalUsers();
		return c.json(users);
	})
	.post("/:userId/approve", async (c) => {
		const userId = c.req.param("userId");
		const { UserRepository, OrganizationRepository, OAuthInternalRepository } =
			c.var;

		// GitHub OAuth で認証している前提
		const oauthConnections =
			await OAuthInternalRepository.fetchOAuthConnectionsByUserId(userId).catch(
				() => [],
			);
		const githubConn = oauthConnections.find(
			(conn) => conn.providerId === OAUTH_PROVIDER_IDS.GITHUB,
		);
		if (!githubConn) {
			return c.text("User not found", 404);
		}

		// 念のため int としてパースして検証
		const githubUserId = Number.parseInt(githubConn.providerUserId, 10);
		if (githubUserId.toString() !== githubConn.providerUserId) {
			return c.text("Invalid GitHub user ID", 500);
		}
		// GitHub Organization に追加
		await OrganizationRepository.inviteToOrganization(githubUserId);

		// すべてが終わったら DB を書き換えて承認済みとする
		await UserRepository.approveProvisionalUser(userId);

		return c.body(null, 204);
	})
	.post("/:userId/reject", async (c) => {
		const userId = c.req.param("userId");
		const { UserRepository } = c.var;
		await UserRepository.rejectProvisionalUser(userId);
		return c.body(null, 204);
	})
	.post("/:userId/confirm-payment", async (c) => {
		const userId = c.req.param("userId");
		const { UserRepository } = c.var;
		await UserRepository.confirmPayment(userId);
		return c.body(null, 204);
	});

export { route as adminUsersRoute };
