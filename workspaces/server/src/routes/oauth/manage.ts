import { vValidator } from "@hono/valibot-validator";
import { stream } from "hono/streaming";
import * as v from "valibot";
import { optimizeImage } from "wasm-image-optimization";
import { type ScopeId, isScopeId } from "../../constants/scope";
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

const verifyOAuthClientMiddleware = factory.createMiddleware(
	async (c, next) => {
		const clientId = c.req.param("clientId");
		if (!clientId) return c.text("Not found", 404);

		const { userId } = c.get("jwtPayload");

		const client = await c.var.OAuthExternalRepository.getClientById(clientId);

		if (!client) return c.text("Not found", 404);

		if (client.managers.every((manager) => manager.id !== userId))
			return c.text("Forbidden", 403);

		c.set("oauthClientInfo", client);
		return next();
	},
);

const registerSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty()),
	description: v.string(),
	// formなので配列はカンマ区切りの文字列として受け取る
	scopeIds: v.pipe(
		v.string(),
		v.transform((input) => input.split(",")),
		v.array(
			v.pipe(
				v.string(),
				v.transform((input) => Number(input)),
				v.custom<ScopeId>(isScopeId),
			),
		),
	),
	callbackUrls: v.pipe(
		v.string(),
		v.transform((input) => input.split(",").map(decodeURIComponent)),
		v.array(
			v.pipe(
				v.string(),
				v.url(),
				v.custom((input) => {
					if (typeof input !== "string") return false;
					// 絶対 URL であること
					if (!URL.canParse(input)) return false;
					// fragment component を含まないこと
					const url = new URL(input);
					return url.hash === "";
				}),
			),
		),
	),
	icon: v.optional(v.pipe(v.file(), v.maxSize(1024 * 1024 * 5))), // 5MiB
});

const managersSchema = v.object({
	managerUserIds: v.array(v.pipe(v.string(), v.nonEmpty())),
});

const secretDescriptionSchema = v.object({
	description: v.string(),
});

const route = app
	.get("/list", authMiddleware, async (c) =>
		c.json(await c.var.OAuthExternalRepository.getClients()),
	)
	.get("/:clientId", authMiddleware, verifyOAuthClientMiddleware, async (c) => {
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
	.post(
		"/register",
		authMiddleware,
		vValidator("form", registerSchema),
		async (c) => {
			// 画像を含むので、multipart/form-data で受け取る
			const { userId } = c.get("jwtPayload");
			const { name, description, scopeIds, callbackUrls, icon } =
				c.req.valid("form");
			const serverOrigin = new URL(c.req.url).origin;

			try {
				const clientId = crypto.randomUUID();
				if (icon) {
					const optimizedImageArrayBuffer = await optimizeImage({
						image: await icon.arrayBuffer(),
						width: 256,
						height: 256,
						format: "webp",
					});

					if (!optimizedImageArrayBuffer) {
						throw new Error("Failed to optimize image");
					}

					const optimizedImageUint8Array = new Uint8Array(
						optimizedImageArrayBuffer,
					);

					await c.var.OAuthAppStorageRepository.uploadAppIcon(
						new Blob([optimizedImageUint8Array], { type: "image/webp" }),
						clientId,
					);
				}
				await c.var.OAuthExternalRepository.registerClient(
					clientId,
					userId,
					name,
					description,
					scopeIds,
					callbackUrls,
					icon
						? `${serverOrigin}/oauth/manage/${clientId}/icon?${Date.now()}`
						: null,
				);
				return c.text("OK");
			} catch (e) {
				return c.text("Failed to register client", 500);
			}
		},
	)
	.get("/:appId/icon", async (c) => {
		const { OAuthAppStorageRepository } = c.var;
		const appId = c.req.param("appId");

		try {
			const body = await OAuthAppStorageRepository.getAppIconURL(appId);
			c.header("Content-Type", "image/webp");
			return stream(c, (s) => s.pipe(body));
		} catch (e) {
			return c.text("Not found", 404);
		}
	})
	.put(
		"/:clientId",
		authMiddleware,
		verifyOAuthClientMiddleware,
		vValidator("form", registerSchema),
		async (c) => {
			const { clientId } = c.req.param();
			const { name, description, scopeIds, callbackUrls, icon } =
				c.req.valid("form");
			const serverOrigin = new URL(c.req.url).origin;

			const client = c.get("oauthClientInfo");
			if (!client) return c.text("Not found", 404);

			try {
				if (icon) {
					const optimizedImageArrayBuffer = await optimizeImage({
						image: await icon.arrayBuffer(),
						width: 256,
						height: 256,
						format: "webp",
					});

					if (!optimizedImageArrayBuffer) {
						throw new Error("Failed to optimize image");
					}

					const optimizedImageUint8Array = new Uint8Array(
						optimizedImageArrayBuffer,
					);

					await c.var.OAuthAppStorageRepository.uploadAppIcon(
						new Blob([optimizedImageUint8Array], { type: "image/webp" }),
						clientId,
					);
				}
				await c.var.OAuthExternalRepository.updateClient(
					clientId,
					name,
					description,
					scopeIds,
					callbackUrls,
					icon
						? `${serverOrigin}/oauth/manage/${clientId}/icon?${Date.now()}`
						: null,
				);
				return c.text("OK");
			} catch (e) {
				return c.text("Failed to update client", 500);
			}
		},
	)
	.delete(
		"/:clientId",
		authMiddleware,
		verifyOAuthClientMiddleware,
		async (c) => {
			const { clientId } = c.req.param();
			await c.var.OAuthExternalRepository.deleteClient(clientId);
			return c.text("OK");
		},
	)
	.put(
		"/:clientId/managers",
		authMiddleware,
		verifyOAuthClientMiddleware,
		vValidator("json", managersSchema),
		async (c) => {
			const { clientId } = c.req.param();
			const { managerUserIds } = c.req.valid("json");

			const client = c.get("oauthClientInfo");
			if (!client) return c.text("Not found", 404);

			// managerUserIds に client.ownerId が含まれているか確認
			if (!managerUserIds.includes(client.ownerId))
				return c.text("Forbidden", 403);

			await c.var.OAuthExternalRepository.updateManagers(
				clientId,
				managerUserIds,
			);

			return c.text("OK");
		},
	)
	.put(
		"/:clientId/secrets",
		authMiddleware,
		verifyOAuthClientMiddleware,
		async (c) => {
			const { clientId } = c.req.param();
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
		},
	)
	.put(
		"/:clientId/secrets/:hash",
		authMiddleware,
		verifyOAuthClientMiddleware,
		vValidator("json", secretDescriptionSchema),
		async (c) => {
			// memo: secret 情報のうち変更できるのは description のみ
			const { clientId, hash: secretHash } = c.req.param();
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
	.delete(
		"/:clientId/secrets/:hash",
		authMiddleware,
		verifyOAuthClientMiddleware,
		async (c) => {
			const { clientId, hash: secretHash } = c.req.param();
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
		},
	);

export { route as oauthManageRoute };
