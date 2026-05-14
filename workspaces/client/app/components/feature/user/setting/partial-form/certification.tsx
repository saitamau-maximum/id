import type { UserCertification } from "@idp/schema/entity/certification";
import { useCallback, useMemo } from "react";
import { Plus, Trash } from "react-feather";
import { css } from "styled-system/css";
import { DeleteConfirmation } from "~/components/feature/delete-confirmation";
import { ConfirmDialog } from "~/components/logic/callable/confirm";
import { ButtonLike } from "~/components/ui/button-like";
import { IconButton } from "~/components/ui/icon-button";
import { Table } from "~/components/ui/table";
import { useAuth } from "~/hooks/use-auth";
import { CertificationRequestDialog } from "../certification-request-dialog";
import { useCertifications } from "../hooks/use-certifications";
import { useDeleteUserCertification } from "../hooks/use-delete-user-certification";
import { useSendCertificationRequest } from "../hooks/use-send-certification-request";

export const UserSettingFormCertification = () => {
	const { user, isLoading } = useAuth();

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
		<>
			<p
				className={css({ color: "gray.600", textAlign: "left", width: "100%" })}
			>
				これまでに取得した資格や試験の情報を登録できます。
				承認待ちのものも含め、申請した資格・試験はプロフィールに表示されます。
			</p>

			<Table.Root loading={isLoading}>
				<Table.Tr>
					<Table.Th>資格・試験名</Table.Th>
					<Table.Th>取得年</Table.Th>
					<Table.Th>承認状態</Table.Th>
					<Table.Th>登録情報の削除</Table.Th>
				</Table.Tr>

				{user?.certifications.length === 0 && (
					<Table.Tr>
						<Table.Td colSpan={4} className={css({ textAlign: "center" })}>
							資格・試験の情報が登録されていません。
						</Table.Td>
					</Table.Tr>
				)}

				{user?.certifications.map((cert) => (
					<Table.Tr key={cert.id}>
						<Table.Td>{cert.title}</Table.Td>
						<Table.Td>{cert.certifiedIn}</Table.Td>
						<Table.Td>
							{cert.isApproved ? (
								<span
									className={css({
										color: "green.600",
									})}
								>
									承認済み
								</span>
							) : (
								<span
									className={css({
										color: "orange.600",
									})}
								>
									承認待ち
								</span>
							)}
						</Table.Td>
						<Table.Td className={css({ textAlign: "center" })}>
							<IconButton
								type="button"
								label="削除"
								onClick={() => handleCertDelete(cert)}
								color="danger"
							>
								<Trash size={16} />
							</IconButton>
						</Table.Td>
					</Table.Tr>
				))}
			</Table.Root>

			{requestableCertifications.length > 0 && (
				<div className={css({ width: "100%", textAlign: "center" })}>
					<button
						type="button"
						onClick={handleCertRequest}
						className={css({
							width: "fit-content",
						})}
					>
						<ButtonLike size="sm" variant="secondary">
							<Plus size={16} />
							資格・試験の情報を申請する
						</ButtonLike>
					</button>
				</div>
			)}

			<p
				className={css({
					color: "gray.600",
					fontSize: "sm",
					textAlign: "left",
					width: "100%",
				})}
			>
				申請すると、情報が正しいか Admin が簡易的にチェックします。
				まったく異なる情報でなければ基本的に承認されます。 反応がなければ
				Discord などで連絡してください。
			</p>
		</>
	);
};
