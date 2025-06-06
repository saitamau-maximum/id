import { factory } from "../../factory";
import { memberOnlyMiddleware } from "../../middleware/auth";

const app = factory.createApp();

const route = app.get("/info", memberOnlyMiddleware, async (c) => {
	const { UserRepository } = c.var;
	try {
		const users = await UserRepository.fetchAllUsers();
		return c.json(users);
	} catch (e) {
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

export { route as adminDashboardRoute };
