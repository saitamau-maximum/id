import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { ROLE_IDS } from "../constants/role";
import { factory } from "../factory";
import {
	authMiddleware,
	roleAuthorizationMiddleware,
} from "../middleware/auth";

const app = factory.createApp();

const createInviteSchema = v.object({
	expiresAt: v.pipe(v.string(), v.isoTimestamp()),
	remainingUse: v.number(),
});

const route = app
	.use(authMiddleware)
	.use(
		roleAuthorizationMiddleware({
			ALLOWED_ROLES: [ROLE_IDS.ADMIN],
		}),
	)
	.post("/", vValidator("json", createInviteSchema), async (c) => {
		const { expiresAt, remainingUse } = c.req.valid("json");
		const createdAt = new Date();
		const issuedBy = c.get("jwtPayload").userId;

		c.header("Cache-Control", "no-store");
		c.header("Pragma", "no-cache");

		// DB に格納して返す
		try {
			await c.var.InviteRepository.createInvite({
				expiresAt: new Date(expiresAt),
				remainingUse,
				createdAt,
				issuedBy,
			});
			return c.json({
				expiresAt,
				remainingUse,
				createdAt,
				issuedBy,
			});
		} catch (e) {
			return c.text("Internal Server Error", 500);
		}
	})
	.put("/:id", async (c) => {
		const id = c.req.param("id");
		try {
			const invite = await c.var.InviteRepository.getInviteById(id);

			if (!invite) {
				return c.text("Invite not found", 404);
			}

			// 招待コードの残り使用回数について検証
			if (invite.remainingUse !== null && invite.remainingUse <= 0) {
				return c.text("Invite has no remaining uses", 400);
			}

			// 招待コードの有効期限について検証
			if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
				return c.text("Invite has expired", 400);
			}

			await c.var.InviteRepository.reduceInviteUsage(id);
			return c.json({ message: "invite code successfully used" });
		} catch (e) {
			return c.text("Internal Server Error", 500);
		}
	})
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		try {
			await c.var.InviteRepository.deleteInvite(id);
			return c.json({ message: "invite code successfully deleted" });
		} catch (e) {
			return c.text("Internal Server Error", 500);
		}
	});

export { route as inviteRoute };
