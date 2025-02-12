import { useId, useMemo } from "react";
import { Copy, Edit, Plus, Trash2 } from "react-feather";
import { useParams } from "react-router";
import { css, cx } from "styled-system/css";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { IconButton } from "~/components/ui/icon-button";
import { useAuth } from "~/hooks/use-auth";
import { useRepository } from "~/hooks/use-repository";
import type { UserBasicInfo } from "~/types/user";
import { OAuthSectionHeader } from "../internal/components/oauth-section-header";
import { UserDisplay } from "../internal/components/user-display";
import { useApp } from "../internal/hooks/use-apps";
import { ConfigSectionHeader } from "./internal/components/config-section-header";
import { ConfigSectionSubHeader } from "./internal/components/config-section-sub-header";

const configSectionStyle = css({
	backgroundColor: "gray.100",
	borderRadius: "lg",
	padding: 4,
});

export default function Config() {
	const { oauthAppId } = useParams<{ oauthAppId: string }>();
	if (!oauthAppId) return null;

	const { user } = useAuth();
	const { data: oauthApp, isLoading: isLoadingApp } = useApp(oauthAppId);
	const appLogoId = useId();
	const appNameId = useId();
	const appDescriptionId = useId();
	const appScopesId = useId();
	const appCallbackUrlsId = useId();

	const { oauthAppsRepository } = useRepository();

	// このページで使うユーザー情報は owner と managers のみなので、使いまわす
	const userId2userInfo = useMemo(() => {
		const res = new Map<string, UserBasicInfo>();
		if (!oauthApp) return res;

		res.set(oauthApp.owner.id, oauthApp.owner);
		for (const manager of oauthApp.managers) {
			res.set(manager.id, manager);
		}

		return res;
	}, [oauthApp]);

	if (!user) return null;
	if (isLoadingApp) return <div>読み込み中...</div>;
	if (!oauthApp) return <div>権限がありません</div>;

	// サーバー側でチェックしているはずだが念のため
	if (oauthApp.managers.every((manager) => manager.id !== user.id))
		return <div>権限がありません</div>;

	const handleAddManager = async () => {
		// TODO
		const userId = prompt("Enter user display ID");
		if (!userId) return;
		try {
			await oauthAppsRepository.addManagers(oauthAppId, [userId]);
			alert("追加しました");
		} catch {
			// TODO
			alert("追加に失敗しました");
		}
	};

	const handleDeleteManager = (managerDisplayId: string) => async () => {
		try {
			await oauthAppsRepository.deleteManagers(oauthAppId, [managerDisplayId]);
			alert("削除しました");
		} catch {
			// TODO
			alert("削除に失敗しました");
		}
	};

	const handleGenerateSecret = async () => {
		try {
			const { secret, secretHash } =
				await oauthAppsRepository.generateSecret(oauthAppId);
			// TODO
			alert(`新しい secret を追加しました: ${secret}`);
		} catch {
			// TODO
			alert("生成に失敗しました");
		}
	};

	const handleUpdateSecretDescription = (secretHash: string) => async () => {
		const description = prompt("Enter description");
		if (!description) return;
		try {
			await oauthAppsRepository.updateSecretDescription(
				oauthAppId,
				secretHash,
				description,
			);
			alert("説明を変更しました");
		} catch {
			// TODO
			alert("説明の変更に失敗しました");
		}
	};

	const handleDeleteSecret = (secretHash: string) => async () => {
		try {
			await oauthAppsRepository.deleteSecret(oauthAppId, secretHash);
			alert("削除しました");
		} catch {
			// TODO
			alert("削除に失敗しました");
		}
	};

	const handleCopyClientId = () => {
		// TODO
		alert("Copied");
	};

	return (
		<div>
			<OAuthSectionHeader
				title={oauthApp.name}
				breadcrumb={[
					{ label: "アプリケーション一覧", to: "/oauth-apps" },
					{ label: "設定" },
				]}
			/>
			<div
				className={css({
					display: "grid",
					gap: 4,
					gridTemplateColumns: "1fr 1fr",
					gridTemplateRows: "auto",
				})}
			>
				<section
					className={cx(
						configSectionStyle,
						css({
							gridArea: "1 / 1 / 2 / 2",
						}),
					)}
				>
					<ConfigSectionHeader>Members</ConfigSectionHeader>
					<ConfigSectionSubHeader title="Owner" />
					<UserDisplay
						displayId={oauthApp.owner.displayId ?? ""}
						name={`${oauthApp.owner.displayName} (@${oauthApp.owner.displayId})`}
						iconURL={oauthApp.owner.profileImageURL ?? ""}
					/>
					<ConfigSectionSubHeader title="Managers">
						<IconButton type="button" onClick={handleAddManager} label="Add">
							<Plus size={16} />
						</IconButton>
					</ConfigSectionSubHeader>
					<div
						className={css({
							display: "flex",
							flexWrap: "wrap",
							gap: "token(spacing.1) token(spacing.4)",
						})}
					>
						{oauthApp.managers.map((manager) => (
							<div
								key={manager.id}
								className={css({
									display: "flex",
									alignItems: "center",
									gap: 2,
								})}
							>
								<UserDisplay
									displayId={manager.displayId ?? ""}
									name={`${manager.displayName} (@${manager.displayId})`}
									iconURL={manager.profileImageURL ?? ""}
								/>
								<IconButton
									type="button"
									onClick={handleDeleteManager(manager.displayId ?? "")}
									label="Remove"
								>
									<Trash2 size={16} className={css({ color: "red.400" })} />
								</IconButton>
							</div>
						))}
					</div>
					<button type="button" className={css({ marginTop: 4 })}>
						<ButtonLike size="sm" variant="danger">
							Revoke all access tokens
						</ButtonLike>
					</button>
				</section>
				<section
					className={cx(
						configSectionStyle,
						css({
							gridArea: "1 / 2 / 2 / 3",
						}),
					)}
				>
					<ConfigSectionHeader>Details</ConfigSectionHeader>
					<ConfigSectionSubHeader title="Client ID" />
					<div
						className={css({ display: "flex", alignItems: "center", gap: 2 })}
					>
						<code
							className={css({
								fontSize: "sm",
								backgroundColor: "gray.200",
								padding: "token(spacing.1) token(spacing.2)",
								borderRadius: "md",
								color: "gray.700",
							})}
						>
							{oauthApp.id}
						</code>
						<IconButton
							type="button"
							onClick={handleCopyClientId}
							label="Copy Client ID"
						>
							<Copy size={16} />
						</IconButton>
					</div>
					<ConfigSectionSubHeader title="Secrets">
						<IconButton
							type="button"
							onClick={handleGenerateSecret}
							label="Add"
						>
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
						{oauthApp.secrets.map((secret) => {
							const issuedUser = userId2userInfo.get(secret.issuedBy);
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
										{secret.description && (
											<p>
												<span
													className={css({
														color: "gray.500",
														marginRight: 2,
														wordBreak: "break-all",
													})}
												>
													({secret.description})
												</span>
												<IconButton
													type="button"
													onClick={handleUpdateSecretDescription(
														secret.secretHash,
													)}
													label="Edit"
												>
													<Edit size={16} />
												</IconButton>
											</p>
										)}
									</div>
									<p
										className={css({
											color: "gray.600",
											fontSize: "sm",
											gridArea: "2 / 1 / 3 / 2",
										})}
									>
										issued by
										{issuedUser ? (
											<UserDisplay
												displayId={issuedUser.displayId ?? ""}
												name={issuedUser.displayName ?? ""}
												iconURL={issuedUser.profileImageURL ?? ""}
											/>
										) : (
											"なんかへんだよ"
										)}
										on {issuedAt.toLocaleString()}
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
											<Trash2 size={16} className={css({ color: "red.400" })} />
										</IconButton>
									</div>
								</div>
							);
						})}
					</div>
				</section>
				<section
					className={cx(
						configSectionStyle,
						css({
							gridArea: "2 / 1 / 3 / 3",
						}),
					)}
				>
					<ConfigSectionHeader>Edit</ConfigSectionHeader>
					<form
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: 6,
						})}
					>
						<Form.FieldSet>
							<label htmlFor={appLogoId}>
								<Form.LabelText>Application Logo</Form.LabelText>
							</label>
							{oauthApp.logoUrl ? (
								<img
									src={oauthApp.logoUrl}
									alt="Logo"
									width={100}
									height={100}
								/>
							) : (
								"No Image"
							)}
							<Form.Input type="file" name="logo" />
						</Form.FieldSet>
						<Form.FieldSet>
							<label htmlFor={appNameId}>
								<Form.LabelText>Application Name</Form.LabelText>
							</label>
							<Form.Input
								id={appNameId}
								type="text"
								value={oauthApp.name}
								required
							/>
						</Form.FieldSet>
						<Form.FieldSet>
							<label htmlFor={appDescriptionId}>
								<Form.LabelText>Application Description</Form.LabelText>
							</label>
							<Form.Input
								id={appDescriptionId}
								value={oauthApp.description ?? ""}
							/>
						</Form.FieldSet>
						<Form.FieldSet>
							<label htmlFor={appScopesId}>
								<Form.LabelText>Scopes</Form.LabelText>
							</label>
							<Form.SelectGroup>
								{/* TODO: 全 scopes から読みだすべき */}
								{oauthApp.scopes.map((scope) => (
									<Form.Select
										key={scope.id}
										value={scope.id}
										label={scope.name}
									/>
								))}
							</Form.SelectGroup>
						</Form.FieldSet>
						<Form.FieldSet>
							<label htmlFor={appCallbackUrlsId}>
								<Form.LabelText>Callback URLs</Form.LabelText>
							</label>
							{oauthApp.callbackUrls.map((callbackUrl) => (
								<Form.Input key={callbackUrl} value={callbackUrl} />
							))}
							[callback url 追加ボタン]
						</Form.FieldSet>
						<button type="submit">
							<ButtonLike>Save</ButtonLike>
						</button>
					</form>
				</section>
			</div>
		</div>
	);
}
