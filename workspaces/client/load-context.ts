import { AppType } from "@idp/server";
import { type AppLoadContext } from "@remix-run/cloudflare";
import { hc } from "hono/client";
import { type PlatformProxy } from "wrangler";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    client: ReturnType<typeof hc<AppType>>;
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: { cloudflare: Cloudflare };
}) => AppLoadContext;

export const getLoadContext: GetLoadContext = ({ context }) => {
  const { IDP_SERVER, MODE } = context.cloudflare.env;

  // https://github.com/cloudflare/workers-sdk/pull/5086
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const isProd = MODE === "production";
  const client = hc<AppType>("http://localhost:8787", {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    fetch: isProd ? IDP_SERVER.fetch.bind(IDP_SERVER) : undefined,
  });

  return {
    ...context,
    client,
  };
};
