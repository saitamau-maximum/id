import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";
import { adminOnlyMiddleware } from "../middleware/auth";

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
		const invite = await InviteRepository.getInviteById(id);
		if (!invite) {
			return c.text("Not Found", 404);
		}
		return c.text("OK", 200);
	} catch {
		return c.text("Not Found", 404);
	}
});

const protectedRoute = app
	.use(adminOnlyMiddleware)
	.get("/", async (c) => {
		const { InviteRepository } = c.var;
		try {
			const invites = await InviteRepository.getAllInvites();
			return c.json(invites);
		} catch (e) {
			return c.text("Internal Server Error", 500);
		}
	})
	.post("/", vValidator("json", createInviteSchema), async (c) => {
		const { expiresAt, remainingUse, title } = c.req.valid("json");

		// 招待リンクはexpiresAt と remainingUse のどちらか一方が必須（共存可能）
		if (!expiresAt && !remainingUse) {
			return c.text("Bad Request", 400);
		}

		const createdAt = new Date();
		const issuedByUserId = c.get("jwtPayload").userId;

		c.header("Cache-Control", "no-store");
		c.header("Pragma", "no-cache");

		// DB に格納して返す
		try {
			const id = await c.var.InviteRepository.createInvite({
				title: title,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
				remainingUse: remainingUse ?? null,
				createdAt,
				issuedByUserId,
			});
			return c.json({ id });
		} catch (e) {
			return c.text("Internal Server Error", 500);
		}
	});

const route = app.route("/", publicRoute).route("/", protectedRoute);
export { route as inviteRoute };
