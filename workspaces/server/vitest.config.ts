import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
	test: {
		exclude: ["src/tests/**/*.test.ts", "dist/**", "node_modules/**"],
		poolOptions: {
			workers: {
				wrangler: { configPath: "./wrangler.toml" },
			},
		},
	},
});
