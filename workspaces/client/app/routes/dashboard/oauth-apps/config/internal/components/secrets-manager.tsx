import { useCallback } from "react";
import { Plus, Trash2 } from "react-feather";
import { css } from "styled-system/css";
import { UserDisplay } from "~/components/feature/user/user-display";
import { ConfirmDialog } from "~/components/logic/callable/comfirm";
import { IconButton } from "~/components/ui/icon-button";
import { useMembers } from "~/routes/dashboard/members/internal/hooks/use-members";
import type { OAuthClientSecret } from "~/types/oauth";
import { useDeleteSecret } from "../hooks/use-delete-secret";
import { useGenerateSecret } from "../hooks/use-generate-secret";
import { ConfigSectionSubHeader } from "./config-section-sub-header";
import { DeleteConfirmation } from "./delete-confirmation";

interface Props {
	appId: string;
	appName: string;
	secrets: OAuthClientSecret[];
}
export const SecretsManager = ({ appId, appName, secrets }: Props) => {
	const { mutate: generateSecret } = useGenerateSecret({ appId });
	const { mutate: deleteSecret } = useDeleteSecret({ appId });
	const { data: members } = useMembers();

	const handleDeleteSecret = useCallback(
		(secretHash: string) => async () => {
			const res = await ConfirmDialog.call({
				title: "シークレットを削除する",
				confirmLabel: "削除",
				danger: true,
				children: <DeleteConfirmation appName={appName} />,
			});
			if (res.type === "dismiss") return;
			deleteSecret({ secretHash });
		},
		[deleteSecret, appName],
	);

	return (
		<>
			<ConfigSectionSubHeader title="Secrets">
				<IconButton type="button" onClick={() => generateSecret()} label="Add">
					<Plus size={16} />
				</IconButton>
			</ConfigSectionSubHeader>
			<div
				className={css({
					display: "flex",
					flexDirection: "column",
					gap: 4,
				})}
			>
				{secrets.map((secret) => {
					const issuedUser = (members || []).find(
						(member) => member.id === secret.issuedBy,
					);
					const issuedAt = new Date(secret.issuedAt);
					return (
						<div
							key={secret.secret}
							className={css({
								display: "grid",
								gap: "token(spacing.1) token(spacing.4)",
								gridTemplateColumns: "1fr auto",
								gridTemplateRows: "auto auto",
							})}
						>
							<div
								className={css({
									display: "flex",
									alignItems: "center",
									gap: 2,
									gridArea: "1 / 1 / 2 / 2",
								})}
							>
								<code
									className={css({
										fontSize: "sm",
										backgroundColor: "gray.200",
										padding: "token(spacing.1) token(spacing.2)",
										height: "max-content",
										lineHeight: 1,
										borderRadius: "md",
										color: "gray.700",
									})}
								>
									{secret.secret}
								</code>
							</div>
							<p
								className={css({
									color: "gray.600",
									fontSize: "sm",
									gridArea: "2 / 1 / 3 / 2",
									display: "flex",
									alignItems: "center",
									gap: 2,
								})}
							>
								<span>issued by</span>
								{issuedUser ? (
									<UserDisplay
										displayId={issuedUser.displayId ?? ""}
										name={issuedUser.displayName ?? ""}
										link
									/>
								) : (
									"なんかへんだよ"
								)}
								<span>on {issuedAt.toLocaleString()}</span>
							</p>
							<div
								className={css({
									gridArea: "1 / 2 / 3 / 3",
									margin: "auto",
								})}
							>
								<IconButton
									type="button"
									onClick={handleDeleteSecret(secret.secretHash)}
									label="Delete"
								>
									<Trash2 size={16} className={css({ color: "rose.400" })} />
								</IconButton>
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
};
