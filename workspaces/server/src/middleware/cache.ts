import { factory } from "../factory";

export const noCacheMiddleware = factory.createMiddleware(async (c, next) => {
	// next 側でキャッシュヘッダがセットされているかもしれないので、
	// 先に next を実行してから上書きする
	await next();

	c.header("Cache-Control", "no-store");
	c.header("Pragma", "no-cache");
	c.header("Expires", "0");
});
