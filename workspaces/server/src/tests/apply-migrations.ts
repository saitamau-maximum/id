// ref: https://github.com/cloudflare/workers-sdk/blob/6ff6b3e1dd5d499ba9f0f84b1ca156280e12069d/fixtures/vitest-pool-workers-examples/d1/test/apply-migrations.ts

import { applyD1Migrations, env } from "cloudflare:test";

declare module "cloudflare:test" {
	interface ProvidedEnv extends Env {
		TEST_MIGRATIONS: D1Migration[];
	}
}

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
