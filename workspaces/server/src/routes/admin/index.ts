import { factory } from "../../factory";
import { adminUsersRoute } from "./user";

const app = factory.createApp();

const route = app.route("/users", adminUsersRoute);

export { route as adminRoute };
