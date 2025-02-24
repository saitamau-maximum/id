import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
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

const registerSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty()),
	description: v.string(),
	scopeIds: v.array(v.number()),
	callbackUrls: v.array(v.pipe(v.string(), v.url())),
	icon: v.pipe(v.file(), v.maxSize(1024 * 1024 * 5)), // 5MiB
});

const managersSchema = v.object({
	managers: v.array(v.pipe(v.string(), v.nonEmpty())),
});

const secretDescriptionSchema = v.object({
	description: v.string(),
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
	.get("/scopes", async (c) =>
		c.json(await c.var.OAuthExternalRepository.getScopes()),
	)
	.post("/register", vValidator("form", registerSchema), async (c) => {
		// 画像を含むので、multipart/form-data で受け取る
		const { userId } = c.get("jwtPayload");
		const { name, description, scopeIds, callbackUrls, icon } =
			c.req.valid("form");

		try {
			await c.var.OAuthExternalRepository.registerClient(
				userId,
				name,
				description,
				scopeIds,
				callbackUrls,
			);
			await c.var.OAuthAppStorageRepository.uploadAppIcon(icon, name);
		} catch (e) {
			return c.text("Failed to register client", 500);
		}
	})
	.put(
		"/:id/update",
		getClientMiddleware,
		vValidator("json", registerSchema),
		async (c) => {
			// TODO
		},
	)
	.put(
		"/:id/managers",
		getClientMiddleware,
		vValidator("json", managersSchema),
		async (c) => {
			const { id: clientId } = c.req.param();
			const { managers: managerDisplayIds } = c.req.valid("json");

			await c.var.OAuthExternalRepository.addManagers(
				clientId,
				managerDisplayIds,
			);

			return c.text("OK");
		},
	)
	.delete(
		"/:id/managers",
		getClientMiddleware,
		vValidator("json", managersSchema),
		async (c) => {
			const { id: clientId } = c.req.param();
			const { managers: managerDisplayIds } = c.req.valid("json");

			await c.var.OAuthExternalRepository.deleteManagers(
				clientId,
				managerDisplayIds,
			);

			return c.text("OK");
		},
	)
	.put("/:id/secrets", getClientMiddleware, async (c) => {
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
	.put(
		"/:id/secrets/:hash",
		getClientMiddleware,
		vValidator("json", secretDescriptionSchema),
		async (c) => {
			// memo: secret 情報のうち変更できるのは description のみ
			const { id: clientId, hash: secretHash } = c.req.param();
			const { description } = c.req.valid("json");

			const client = c.get("oauthClientInfo");
			if (!client) return c.text("Not found", 404);

			for (const secret of client.secrets) {
				if ((await generateHash(secret.secret)) === secretHash) {
					await c.var.OAuthExternalRepository.updateClientSecretDescription(
						clientId,
						secret.secret,
						description,
					);
					return c.text("OK");
				}
			}

			return c.text("Not found", 404);
		},
	)
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
