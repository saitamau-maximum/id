import { factory } from "../../factory";
import { authMiddleware } from "../../middleware/auth";

const app = factory.createApp();

const route = app
	.use(authMiddleware)
	.get("/list", async (c) =>
		c.json(await c.var.OAuthExternalRepository.getClients()),
	)
	.get("/:id", async (c) => {
		const { id: clientId } = c.req.param();
		const { userId } = c.get("jwtPayload");

		const client = await c.var.OAuthExternalRepository.getClientById(clientId);

		if (!client) return c.text("Not found", 404);

		if (client.managers.every((manager) => manager.id !== userId))
			return c.text("Forbidden", 403);

		const { secrets, ...rest } = client;

		return c.json({
			...rest,
			secrets: secrets.map((secret) => ({
				...secret,
				// secret は 8bit * 39 = 312bit = 6bit * 52 -> 52 文字
				secret: `******${secret.secret.slice(-6)}`,
			})),
		});
	});

export { route as oauthManageRoute };
