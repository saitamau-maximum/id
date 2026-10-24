import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: "./wrangler.toml" },
		}),
	],
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
	},
});
