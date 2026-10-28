import { join } from "node:path";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig(async () => {
	// D1 migrations
	// ref: https://github.com/cloudflare/workers-sdk/blob/ac79539606c583de8b7cb52c1c4857855d385961/fixtures/vitest-plugin-examples/d1/
	const migrationsPath = join(import.meta.dirname, "drizzle");
	const migrations = await readD1Migrations(migrationsPath);

	return {
		plugins: [
			cloudflareTest({
				wrangler: { configPath: "./wrangler.jsonc" },
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
