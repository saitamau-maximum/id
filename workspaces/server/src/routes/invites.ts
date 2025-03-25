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
		// expiresAtは1時間後
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

		const remainingUse = 1;

		const createdAt = new Date();

		const issuedBy = c.get("jwtPayload").userId;

		c.header("Cache-Control", "no-store");
		c.header("Pragma", "no-cache");

		// DB に格納して返す
		try {
			await c.var.InvitesRepository.createInvite(
				expiresAt,
				remainingUse,
				createdAt,
				issuedBy,
			);
			return c.json({
				expiresAt,
				remainingUse,
				createdAt,
				issuedBy,
			});
		} catch (e) {
			console.error(e);
			return c.text("Internal Server Error", 500);
		}
	})
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		try {
			await c.var.InvitesRepository.deleteInvite(id);
			return c.json({ message: "invite code successfully deleted" });
		} catch (e) {
			console.error(e);
			return c.text("Internal Server Error", 500);
		} finally {
			console.log(`Delete attempt for invite ID: ${id}`);
		}
	});

export { route as inviteTokenRoute };
