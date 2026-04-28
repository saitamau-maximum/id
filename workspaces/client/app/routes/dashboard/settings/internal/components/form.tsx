import type { UserCertification } from "@idp/schema/entity/certification";
import { OAUTH_PROVIDER_IDS } from "@idp/schema/entity/oauth-internal/oauth-provider";
import { useCallback, useMemo } from "react";
import { Plus } from "react-feather";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { CertificationCard } from "~/components/feature/user/certification-card";
import { ProfileForm } from "~/components/feature/user/profile-form";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { Table } from "~/components/ui/table";
import { useAuth } from "~/hooks/use-auth";
import {
	useCertifications,
	useDeleteUserCertification,
} from "../hooks/use-certifications";
import { useSendCertificationRequest } from "../hooks/use-send-certification-request";
import { useUpdateProfile } from "../hooks/use-update-profile";
import { CertificationRequest } from "./certification-request";
import { OAuthConnRow } from "./oauth-conn-row";

export const ProfileUpdateForm = () => {
	const { mutate, isPending } = useUpdateProfile();
	const { mutate: sendCertificationRequest } = useSendCertificationRequest();
	const { user } = useAuth();
	const { data: certifications } = useCertifications();
	const { mutate: deleteCertification } = useDeleteUserCertification();

	const requestableCertifications = useMemo(() => {
		const requestedIds = user?.certifications.map((c) => c.id) || [];
		return certifications?.filter((c) => !requestedIds.includes(c.id)) || [];
	}, [certifications, user]);

	const handleCertRequest = useCallback(async () => {
		if ((requestableCertifications ?? []).length === 0) return;
		const res = await CertificationRequest.call({
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

	const certificationSection = (
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

	const oauthSection = (
		<Form.FieldSet>
			<legend>
				<Form.LabelText>OAuth を使ったログイン</Form.LabelText>
			</legend>

			<Table.Root>
				<Table.Tr>
					<Table.Th>サービス</Table.Th>
					<Table.Th>アカウント</Table.Th>
					<Table.Th>連携</Table.Th>
				</Table.Tr>
				{Object.values(OAUTH_PROVIDER_IDS).map((providerId) => (
					<OAuthConnRow
						key={providerId}
						providerId={providerId}
						conns={user?.oauthConnections ?? []}
					/>
				))}
			</Table.Root>
		</Form.FieldSet>
	);

	return (
		<ProfileForm
			mode="settings"
			onSubmit={(data) => mutate(data)}
			isPending={isPending}
			submitLabel="更新"
			certificationSection={certificationSection}
			oauthSection={oauthSection}
		/>
	);
};
