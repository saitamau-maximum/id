import { factory } from "../factory";

const app = factory.createApp();

const route = app.get("/events", async (c) => {
    return c.text("Hello, world!");
});

export { route as calendarRoute };