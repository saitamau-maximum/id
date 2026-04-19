import * as v from "valibot";
import {
	Certification,
	UserCertificationRelation,
} from "../entity/certification";
import { CertificationRequestWithUser } from "../entity/certification-request";

export const GetAllCertificationsResponse = v.array(Certification);
export type GetAllCertificationsResponse = v.InferOutput<
	typeof GetAllCertificationsResponse
>;

export const CertificationRequestParams = v.object({
	certificationId: v.pipe(v.string(), v.nonEmpty()),
	certifiedIn: v.pipe(v.number(), v.minValue(2000)),
});
export type CertificationRequestParams = v.InferOutput<
	typeof CertificationRequestParams
>;

export const GetCertificationRequestsResponse = v.array(
	CertificationRequestWithUser,
);
export type GetCertificationRequestsResponse = v.InferOutput<
	typeof GetCertificationRequestsResponse
>;

export const CertificationReviewParams = v.object({
	...UserCertificationRelation.entries,
	isApproved: v.boolean(),
});
export type CertificationReviewParams = v.InferOutput<
	typeof CertificationReviewParams
>;

export const CertificationCreateParams = v.omit(Certification, ["id"]);
export type CertificationCreateParams = v.InferOutput<
	typeof CertificationCreateParams
>;

export const CertificationUpdateParams = v.pick(Certification, ["description"]);
export type CertificationUpdateParams = v.InferOutput<
	typeof CertificationUpdateParams
>;
