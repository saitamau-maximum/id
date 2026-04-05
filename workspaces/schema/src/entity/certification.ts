import * as v from "valibot";

/**
 * 資格・試験の情報
 */
export const Certification = v.object({
	id: v.string(),
	title: v.string(),
	description: v.string(),
});
export type Certification = v.InferOutput<typeof Certification>;

/**
 * ユーザーが持つ資格・試験の情報
 */
export const UserCertification = v.intersect([
	Certification,
	v.object({
		certifiedIn: v.pipe(v.number(), v.integer()),
		isApproved: v.boolean(),
	}),
]);
export type UserCertification = v.InferOutput<typeof UserCertification>;
