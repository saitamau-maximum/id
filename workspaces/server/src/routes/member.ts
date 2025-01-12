import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";

const app = factory.createApp();

const route = app.use(authMiddleware).get("/list", async (c) => {
	const { UserRepository } = c.var;
	try {
		const members = await UserRepository.fetchMembers();
		return c.json(members);
	} catch (e) {
		return c.json({ error: "member not found" }, 404);
	}
});

export { route as memberRoute };
