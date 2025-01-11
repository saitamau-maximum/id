import { DEV_FLAGS, PROD_FLAGS } from "@idp/flag";

// SHAKEさせるために、import.meta.env.PRODを使って定数でバンドルする
export const FLAG = import.meta.env.PROD ? PROD_FLAGS : DEV_FLAGS;
