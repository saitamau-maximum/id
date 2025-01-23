import { factory } from "../../factory";
import { authMiddleware } from "../../middleware/auth";

const app = factory.createApp();

const generateHash = async (secret: string) => {
	const hashBuffer = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(secret),
	);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hashHex;
};

const getClientMiddleware = factory.createMiddleware(async (c, next) => {
	const { id: clientId } = c.req.param();
	const { userId } = c.get("jwtPayload");

	const client = await c.var.OAuthExternalRepository.getClientById(clientId);

	if (!client) return c.text("Not found", 404);

	if (client.managers.every((manager) => manager.id !== userId))
		return c.text("Forbidden", 403);

	c.set("oauthClientInfo", client);
	return next();
});

const route = app
	.use(authMiddleware)
	.get("/list", async (c) =>
		c.json(await c.var.OAuthExternalRepository.getClients()),
	)
	.get("/:id", getClientMiddleware, async (c) => {
		const client = c.get("oauthClientInfo");
		if (!client) return c.text("Not found", 404);
		const { secrets, ...rest } = client;

		return c.json({
			...rest,
			secrets: await Promise.all(
				secrets.map(async (secret) => ({
					...secret,
					// secret は 8bit * 39 = 312bit = 6bit * 52 -> 52 文字
					secret: `******${secret.secret.slice(-6)}`,
					// こうしてしまうと削除時などに secret が特定できないので、 hash を生成
					secretHash: await generateHash(secret.secret),
				})),
			),
		});
	})
	.post("/:id/secrets/generate", getClientMiddleware, async (c) => {
		const { id: clientId } = c.req.param();
		const { userId } = c.get("jwtPayload");

		const client = c.get("oauthClientInfo");
		if (!client) return c.text("Not found", 404);

		const secret = await c.var.OAuthExternalRepository.generateClientSecret(
			clientId,
			userId,
		);

		return c.json({
			secret,
			secretHash: await generateHash(secret),
		});
	})
	.delete("/:id/secrets/:hash", getClientMiddleware, async (c) => {
		const { id: clientId, hash: secretHash } = c.req.param();
		const client = c.get("oauthClientInfo");
		if (!client) return c.text("Not found", 404);

		for (const secret of client.secrets) {
			if ((await generateHash(secret.secret)) === secretHash) {
				await c.var.OAuthExternalRepository.deleteClientSecret(
					clientId,
					secret.secret,
				);
				return c.text("OK");
			}
		}

		return c.text("Not found", 404);
	});

export { route as oauthManageRoute };
