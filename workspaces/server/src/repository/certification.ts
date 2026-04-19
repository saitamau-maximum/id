import type {
	Certification,
	CertificationSummary,
	UserCertification,
	UserCertificationRelation,
} from "@idp/schema/entity/certification";
import type { CertificationRequestWithUser } from "@idp/schema/entity/certification-request";
import type { User } from "@idp/schema/entity/user";

export type GetAllCertificationsRes = Certification[];
export type GetAllCertificationRequestsRes = CertificationRequestWithUser[];
export type GetCertificationsSummaryRes = CertificationSummary[];

export type CertificationRequestParams = UserCertificationRelation & {
	certifiedIn: UserCertification["certifiedIn"];
};
export type CreateCertificationParams = Omit<Certification, "id">;
// title を変更させないのは、例えば「FE を登録 -> 申請・承認 -> AP に変更」とされなくないため
export type UpdateCertificationParams = Omit<Certification, "title">;
export type ExistsUserCertificationParams = UserCertificationRelation;
export type DeleteUserCertificationParams = UserCertificationRelation;

export interface ICertificationRepository {
	getAllCertifications: () => Promise<GetAllCertificationsRes>;
	requestCertification: (params: CertificationRequestParams) => Promise<void>;
	getAllCertificationRequests: () => Promise<GetAllCertificationRequestsRes>;
	approveCertificationRequest(
		userId: User["id"],
		certificationId: Certification["id"],
	): Promise<void>;
	rejectCertificationRequest(
		userId: User["id"],
		certificationId: Certification["id"],
	): Promise<void>;
	existsCertification: (
		certificationId: Certification["id"],
	) => Promise<boolean>;
	createCertification: (params: CreateCertificationParams) => Promise<void>;
	updateCertification: (params: UpdateCertificationParams) => Promise<void>;
	deleteCertification: (certificationId: Certification["id"]) => Promise<void>;
	existsUserCertification: (
		params: ExistsUserCertificationParams,
	) => Promise<boolean>;
	deleteUserCertification: (
		params: DeleteUserCertificationParams,
	) => Promise<void>;
	getCertificationsSummary: () => Promise<GetCertificationsSummaryRes>;
}
