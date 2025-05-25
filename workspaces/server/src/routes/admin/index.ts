import { factory } from "../../factory";
import { adminDashboardRoute } from "./dashboard";
import { adminUsersRoute } from "./user";

const app = factory.createApp();

const route = app
	.route("/users", adminUsersRoute)
	.route("/dashboard", adminDashboardRoute);

export { route as adminRoute };
