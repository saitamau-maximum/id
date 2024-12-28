import type { MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";

import { getRandomState } from "../../utils/get-random-state";
import { AuthFlow } from "./auth-flow";
import type { MaximumScope } from "./types";

export function maximumAuth(options: {
  client_id?: string;
  client_secret?: string;
  scope?: MaximumScope[];
}): MiddlewareHandler {
  return async (c, next) => {
    const newState = getRandomState();

    const auth = new AuthFlow({
      client_id: options.client_id || (env(c).MAXIMUM_AUTH_ID as string),
      client_secret:
        options.client_secret || (env(c).MAXIMUM_AUTH_SECRET as string),
      scope: options.scope,
      state: newState,
      code: c.req.query("code"),
    });

    if (c.req.url.includes("?")) {
      const storedState = getCookie(c, "state");
      if (c.req.query("state") !== storedState) {
        throw new HTTPException(401);
      }
    }

    if (!auth.code) {
      setCookie(c, "state", newState, {
        maxAge: 60 * 10,
        httpOnly: true,
        path: "/",
        // secure: true,
      });

      return c.redirect(auth.redirect());
    }

    await auth.getUserData();

    c.set("token", auth.token);
    c.set("user-maximum", auth.user);
    c.set("granted-scopes", auth.granted_scopes);

    await next();
  };
}
