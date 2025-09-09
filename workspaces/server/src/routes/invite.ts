import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";
import { adminOnlyMiddleware } from "../middleware/auth";
import { noCacheMiddleware } from "../middleware/cache";
import { validateInvitation } from "../service/invite";

const app = factory.createApp();

const createInviteSchema = v.object({
	title: v.pipe(v.string(), v.nonEmpty(), v.maxLength(64)),
	expiresAt: v.optional(v.pipe(v.string(), v.isoTimestamp())),
	remainingUse: v.optional(v.pipe(v.number(), v.minValue(1))),
});

const publicRoute = app.get("/:id", async (c) => {
	const id = c.req.param("id");
	const { InviteRepository } = c.var;
	try {
		await validateInvitation(InviteRepository, id);
		return c.body(null, 204);
	} catch (e) {
		return c.text((e as Error).message, 400);
	}
});

const protectedRoute = app
	.use(adminOnlyMiddleware)
	.get("/", async (c) => {
		const { InviteRepository } = c.var;
		const invites = await InviteRepository.getAllInvites();
		return c.json(invites);
	})
	.post(
		"/",
		noCacheMiddleware,
		vValidator("json", createInviteSchema),
		async (c) => {
			const { expiresAt, remainingUse, title } = c.req.valid("json");

			// 招待リンクはexpiresAt と remainingUse のどちらか一方が必須（共存可能）
			if (!expiresAt && !remainingUse) {
				return c.body(null, 400);
			}

			const createdAt = new Date();
			const issuedByUserId = c.get("jwtPayload").userId;

			// DB に格納して返す
			const id = await c.var.InviteRepository.createInvite({
				title: title,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
				remainingUse: remainingUse ?? null,
				createdAt,
				issuedByUserId,
			});
			return c.json({ id }, 201);
		},
	)
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		const { InviteRepository } = c.var;

		// 招待存在チェック
		const invite = await InviteRepository.getInviteById(id).catch(() => null);
		if (!invite) {
			return c.body(null, 404);
		}

		try {
			await InviteRepository.deleteInvite(id);
			return c.body(null, 204);
		} catch (e) {
			return c.text((e as Error).message, 500);
		}
	});

const route = app.route("/", publicRoute).route("/", protectedRoute);
export { route as inviteRoute };
