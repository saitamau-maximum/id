import * as v from "valibot";
import { CertificationSummary } from "../entity/certification";
import { PublicMember } from "../entity/member";

export const GetPublicMemberResponse = v.union([
	v.object({
		error: v.literal(false),
		...PublicMember.entries,
		roles: v.array(v.string()),
	}),
	v.object({
		error: v.literal(true),
		message: v.string(),
	}),
]);
export type GetPublicMemberResponse = v.InferOutput<
	typeof GetPublicMemberResponse
>;

export const GetCertificationsResponse = v.array(CertificationSummary);
export type GetCertificationsResponse = v.InferOutput<
	typeof GetCertificationsResponse
>;

export const GetAffiliationsSummaryResponse = v.record(
	v.string(),
	v.pipe(v.number(), v.integer(), v.minValue(0)),
);
export type GetAffiliationsSummaryResponse = v.InferOutput<
	typeof GetAffiliationsSummaryResponse
>;
