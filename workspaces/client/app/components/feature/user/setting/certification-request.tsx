import type { UserCertification } from "@idp/schema/entity/certification";
import { useCallback, useMemo } from "react";
import { Plus } from "react-feather";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { CertificationCard } from "~/components/feature/user/certification-card";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { useAuth } from "~/hooks/use-auth";
import { CertificationRequestDialog } from "./certification-request-dialog";
import { useCertifications } from "./hooks/use-certifications";
import { useDeleteUserCertification } from "./hooks/use-delete-user-certification";
import { useSendCertificationRequest } from "./hooks/use-send-certification-request";

export const UserSettingCertificationRequest = () => {
	const { user } = useAuth();

	const { mutate: sendCertificationRequest } = useSendCertificationRequest();
	const { data: certifications } = useCertifications();
	const { mutate: deleteCertification } = useDeleteUserCertification();

	const requestableCertifications = useMemo(() => {
		const requestedIds = user?.certifications.map((c) => c.id) || [];
		return certifications?.filter((c) => !requestedIds.includes(c.id)) || [];
	}, [certifications, user]);

	const handleCertRequest = useCallback(async () => {
		if ((requestableCertifications ?? []).length === 0) return;
		const res = await CertificationRequestDialog.call({
			certifications: requestableCertifications,
		});
		if (res.type === "dismiss") return;
		sendCertificationRequest(res.request);
	}, [requestableCertifications, sendCertificationRequest]);

	const handleCertDelete = useCallback(
		async (certification: UserCertification) => {
			const res = await ConfirmDialog.call({
				title: "資格・試験の削除",
				danger: true,
				children: <DeleteConfirmation title={certification.title} />,
			});
			if (res.type === "dismiss") return;
			deleteCertification(certification.id);
		},
		[deleteCertification],
	);

	return (
		<Form.FieldSet>
			<legend>
				<Form.LabelText>資格・試験</Form.LabelText>
			</legend>
			<CertificationCard
				certifications={user?.certifications ?? []}
				onClick={handleCertDelete}
			/>
			{requestableCertifications.length > 0 && (
				<button type="button" onClick={handleCertRequest}>
					<ButtonLike size="sm" variant="secondary">
						<Plus size={16} />
						資格・試験の情報を申請する
					</ButtonLike>
				</button>
			)}
		</Form.FieldSet>
	);
};
