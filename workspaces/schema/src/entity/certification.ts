import * as v from "valibot";
import { UserBasicInfo } from "./user";

/**
 * 資格・試験の情報
 */
export const Certification = v.object({
	id: v.string(),
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.string(),
});
export type Certification = v.InferOutput<typeof Certification>;

/**
 * ユーザーが持つ資格・試験の情報
 */
export const UserCertification = v.object({
	...Certification.entries,
	certifiedIn: v.pipe(v.number(), v.integer()),
	isApproved: v.boolean(),
});
export type UserCertification = v.InferOutput<typeof UserCertification>;

/**
 * ユーザーとしての資格・試験の Relation
 */
export const UserCertificationRelation = v.object({
	userId: v.string(),
	certificationId: Certification.entries.id,
});
export type UserCertificationRelation = v.InferOutput<
	typeof UserCertificationRelation
>;

/**
 * ユーザー情報を含めた資格・試験の申請情報
 */
export const CertificationRequestWithUser = v.object({
	user: UserBasicInfo,
	certificationId: Certification.entries.id,
	certifiedIn: UserCertification.entries.certifiedIn,
});
export type CertificationRequestWithUser = v.InferOutput<
	typeof CertificationRequestWithUser
>;

/**
 * 資格ごとの保有者数の情報
 */
export const CertificationSummary = v.object({
	id: Certification.entries.id,
	title: Certification.entries.title,
	numberOfHolders: v.pipe(v.number(), v.integer(), v.minValue(0)),
});
export type CertificationSummary = v.InferOutput<typeof CertificationSummary>;
