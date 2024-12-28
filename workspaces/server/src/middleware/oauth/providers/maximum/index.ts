import type { OAuthVariables } from "../../types";
import type { MaximumUser } from "./types";
export { maximumAuth } from "./maximum-auth";
export * from "./types";

declare module "hono" {
  interface ContextVariableMap extends OAuthVariables {
    "user-maximum": Partial<MaximumUser> | undefined;
  }
}
