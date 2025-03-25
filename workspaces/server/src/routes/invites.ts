import { ROLE_IDS } from "../constants/role";
import { factory } from "../factory";
import {
	authMiddleware,
	roleAuthorizationMiddleware,
} from "../middleware/auth";

const app = factory.createApp();

const route = app
	.use(authMiddleware)
	.use(
		roleAuthorizationMiddleware({
			ALLOWED_ROLES: [ROLE_IDS.ADMIN],
		}),
	)
	.post("/", async (c) => {
		const expiresAt = null;
		const remainingUse = null;
		const createdAt = new Date();
		const issuedBy = c.get("jwtPayload").userId;

		c.header("Cache-Control", "no-store");
		c.header("Pragma", "no-cache");

		// DB に格納して返す
		try {
			await c.var.InvitesRepository.createInvite({
				expiresAt,
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
			const invite = await c.var.InvitesRepository.getInviteById(id);

			if (!invite) {
				return c.text("Invite not found", 404);
			}

			if (invite.remainingUse === 0) {
				return c.text("Invite has no remaining uses", 400);
			}

			await c.var.InvitesRepository.reduceInviteUsage(id);
			return c.json({ message: "invite code successfully used" });
		} catch (e) {
			return c.text("Internal Server Error", 500);
		}
	})
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		try {
			await c.var.InvitesRepository.deleteInvite(id);
			return c.json({ message: "invite code successfully deleted" });
		} catch (e) {
			return c.text("Internal Server Error", 500);
		}
	});

export { route as inviteTokenRoute };
