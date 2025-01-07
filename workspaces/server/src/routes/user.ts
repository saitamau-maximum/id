import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";

const app = factory.createApp();

const registerSchema = v.object({
	displayName: v.pipe(v.string(), v.nonEmpty()),
	email: v.pipe(v.string(), v.nonEmpty(), v.email()),
	studentId: v.pipe(v.string(), v.nonEmpty()),
	grade: v.pipe(v.string(), v.nonEmpty()),
});

const route = app
	.use(authMiddleware)
	.post("/register", vValidator("json", registerSchema), async (c) => {
		const payload = c.get("jwtPayload");
		const { UserRepository } = c.var;

		const { displayName, email, studentId, grade } = c.req.valid("json");

		await UserRepository.updateUser(payload.userId, {
			displayName,
			email,
			studentId,
			grade,
		});

		return c.text("ok", 200);
	});

export { route as userRoute };
