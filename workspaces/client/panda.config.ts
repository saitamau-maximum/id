import { defineConfig } from "@pandacss/dev";

export default defineConfig({
	// Whether to use css reset
	preflight: true,

	// Where to look for your css declarations
	include: ["./app/**/*.{js,jsx,ts,tsx}"],

	// Files to exclude
	exclude: [],

	// Useful for theme customization
	theme: {
		extend: {
			tokens: {
				gradients: {
					primary: {
						value: {
							type: "linear",
							placement: "to right bottom",
							stops: ["#34AA8E", "#63C178"],
						},
					},
				},
			},
			keyframes: {
				zoom: {
					"0%": {
						transform: "scale(0.8)",
					},
					"100%": {
						transform: "scale(1)",
					},
				},
				fadein: {
					from: {
						opacity: 0,
					},
					to: {
						opacity: 1,
					},
				},
			},
		},
	},

	shorthands: false,

	minify: true,
	hash: true,

	// The output directory for your css system
	outdir: "styled-system",
});
