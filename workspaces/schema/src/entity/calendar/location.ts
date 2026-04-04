import * as v from "valibot";

export const Location = v.object({
	id: v.string(),
	name: v.string(),
	description: v.string(),
	createdAt: v.date(),
});
export type Location = v.InferOutput<typeof Location>;
