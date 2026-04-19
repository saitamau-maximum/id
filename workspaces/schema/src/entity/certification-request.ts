import * as v from "valibot";
import { Certification, UserCertification } from "./certification";
import { UserBasicInfo } from "./user";

// 循環参照しちゃって certification.ts には入れられないので

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
