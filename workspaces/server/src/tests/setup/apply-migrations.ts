// ref: https://github.com/cloudflare/workers-sdk/blob/ac79539606c583de8b7cb52c1c4857855d385961/fixtures/vitest-plugin-examples/d1/test/apply-migrations.ts

import { applyD1Migrations, type D1Migration } from "cloudflare:test";
import { env as _env } from "cloudflare:workers";

// ここでしか TEST_MIGRATIONS を使わないので export しない
interface TestEnv extends Cloudflare.Env {
	TEST_MIGRATIONS: D1Migration[];
}
const env = _env as TestEnv;

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
