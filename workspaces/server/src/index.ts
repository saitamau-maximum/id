import { drizzle } from "drizzle-orm/d1";
import { factory } from "./factory";
import { maximumAuth } from "./middleware/oauth/providers/maximum/maximum-auth";

const app = factory.createApp();

const route = app
  .use("/auth/maximum", async (c, next) => {
    return maximumAuth({
      client_id: c.env.MAXIMUM_AUTH_ID,
      client_secret: c.env.MAXIMUM_AUTH_SECRET,
      scope: ["read:basic_info"],
    })(c, next);
  })
  .use(async (c, next) => {
    const client = drizzle(c.env.DB);
    await next();
  })
  .get("/", (c) => {
    console.log(c.var["user-maximum"]);
    return c.text("Hello Maximum IDP Server!");
  });

export default app;

export type AppType = typeof route;
