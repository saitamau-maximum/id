import { Hono } from "hono";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { vValidatorForFormdata } from "./v-validator";

describe("vValidatorForFormdata", () => {
	const schema = v.object({
		array: v.array(v.string()),
		string: v.string(),
	});

	const app = new Hono();
	app
		.post("/test", vValidatorForFormdata("form", ["array"], schema), (c) => {
			return c.json(c.req.valid("form"));
		})
		.post("/test2", vValidatorForFormdata("form", [], schema), (c) => {
			return c.json(c.req.valid("form"));
		});

	it("should normally validate and transform form data", async () => {
		const data = new FormData();
		data.append("array", "value1");
		data.append("array", "value2");
		data.append("string", "value3");

		const res = await app.request("/test", {
			method: "POST",
			body: data,
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json).toEqual({
			array: ["value1", "value2"],
			string: "value3",
		});
	});

	it("should convert to array if specified in arrayKeys", async () => {
		const data = new FormData();
		data.append("array", "value1");
		data.append("string", "value2");

		const res = await app.request("/test", {
			method: "POST",
			body: data,
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json).toEqual({
			array: ["value1"],
			string: "value2",
		});
	});

	it("should not convert to array if not specified in arrayKeys", async () => {
		const data = new FormData();
		data.append("array", "value1");
		data.append("string", "value2");

		const res = await app.request("/test2", {
			method: "POST",
			body: data,
		});

		const json = await res.json();
		expect(res.status).toBe(400);
		expect(json).toEqual({
			issues: [
				{
					expected: "Array",
					input: "value1",
					kind: "schema",
					message: 'Invalid type: Expected Array but received "value1"',
					path: [
						{
							input: {
								array: "value1",
								string: "value2",
							},
							key: "array",
							origin: "value",
							type: "object",
							value: "value1",
						},
					],
					received: '"value1"',
					type: "array",
				},
			],
			output: {
				array: "value1",
				string: "value2",
			},
			success: false,
			typed: false,
		});
	});

	it("should normally validate and transform form data even if arrayKeys is empty", async () => {
		const data = new FormData();
		data.append("array", "value1");
		data.append("array", "value2");
		data.append("string", "value3");

		const res = await app.request("/test2", {
			method: "POST",
			body: data,
		});
		const json = await res.json();

		expect(res.status).toBe(200);
		expect(json).toEqual({
			array: ["value1", "value2"],
			string: "value3",
		});
	});
});
