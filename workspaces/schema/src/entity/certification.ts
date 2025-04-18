import * as v from "valibot";

/**
 * Certificationの情報
 */
export const Certification = v.object({
	id: v.string(),
	title: v.string(),
	description: v.string(),
	certifiedIn: v.number(),
	isApproved: v.boolean(),
});

export type Certification = v.InferOutput<typeof Certification>;
