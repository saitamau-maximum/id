import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
	test: {
		exclude: ["src/tests/**/*.test.ts", "dist/**", "node_modules/**"],
		// Error: no such module みたいなのが出てくるので
		// ref: https://developers.cloudflare.com/workers/testing/vitest-integration/known-issues/#module-resolution
		deps: {
			optimizer: {
				ssr: {
					enabled: true,
					include: ["discord-api-types/v10", "ics", "wasm-image-optimization"],
				},
			},
		},
		poolOptions: {
			workers: {
				wrangler: { configPath: "./wrangler.toml" },
			},
		},
	},
});
