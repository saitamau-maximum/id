import { factory } from "../../factory";
import { authMiddleware } from "../../middleware/auth";

const app = factory.createApp();

const route = app
	.use(authMiddleware)
	.get("/list", async (c) =>
		c.json(await c.var.OAuthExternalRepository.getClients()),
	);

export { route as oauthManageRoute };
