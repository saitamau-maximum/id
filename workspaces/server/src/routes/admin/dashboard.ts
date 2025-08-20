import { factory } from "../../factory";
import { memberOnlyMiddleware } from "../../middleware/auth";

const app = factory.createApp();

const route = app.get("/info", memberOnlyMiddleware, async (c) => {
	const { UserRepository } = c.var;
	const users = await UserRepository.fetchAllUsers();
	return c.json(users);
});

export { route as adminDashboardRoute };
