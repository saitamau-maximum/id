import { drizzle } from "drizzle-orm/d1";
import { factory } from "./factory";

const app = factory.createApp();

const route = app
  .use(async (c, next) => {
    const client = drizzle(c.env.DB);
    await next();
  })
  .get("/", (c) => c.text("Hello Maximum IDP Server!"));

export default app;

export type AppType = typeof route;
