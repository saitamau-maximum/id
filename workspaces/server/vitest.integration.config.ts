import { join } from "node:path";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
	// D1 migrations
	// ref: https://github.com/cloudflare/workers-sdk/tree/6ff6b3e1dd5d499ba9f0f84b1ca156280e12069d/fixtures/vitest-pool-workers-examples/d1
	const migrationsPath = join(__dirname, "drizzle");
	const migrations = await readD1Migrations(migrationsPath);

	return {
		plugins: [
			cloudflareTest({
				wrangler: { configPath: "./wrangler.toml" },
				miniflare: {
					bindings: {
						TEST_MIGRATIONS: migrations,
					},
				},
			}),
		],
		test: {
			include: ["src/tests/**/*.test.ts"],
			setupFiles: ["./src/tests/setup/apply-migrations.ts"],
			// Error: no such module みたいなのが出てくるので
			// ref: https://developers.cloudflare.com/workers/testing/vitest-integration/known-issues/#module-resolution
			deps: {
				optimizer: {
					ssr: {
						enabled: true,
						include: [
							"discord-api-types/v10",
							"ics",
							"wasm-image-optimization",
						],
					},
				},
			},
		},
	};
});
