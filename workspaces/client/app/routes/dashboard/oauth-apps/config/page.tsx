import { useId, useMemo } from "react";
import { ChevronLeft } from "react-feather";
import { Link, useParams } from "react-router";
import { AnchorLike } from "~/components/ui/anchor-like";
import { ButtonLike } from "~/components/ui/button-like";
import { Form } from "~/components/ui/form";
import { useAuth } from "~/hooks/use-auth";
import { useRepository } from "~/hooks/use-repository";
import type { UserBasicInfo } from "~/repository/oauth-apps";
import { useApp } from "../internal/hooks/use-apps";

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

	const handleDeleteSecret = (secretHash: string) => async () => {
		try {
			await oauthAppsRepository.deleteSecretByHash(oauthAppId, secretHash);
			// TODO: reload
		} catch {
			// TODO
			alert("削除に失敗しました");
		}
	};

	return (
		<div>
			<h1>{oauthApp.name}</h1>
			<Link to="/oauth-apps">
				<AnchorLike>
					<ChevronLeft /> 戻る
				</AnchorLike>
			</Link>
			<h2>Members</h2>
			<p>
				Owner:{" "}
				{oauthApp.owner.profileImageURL && (
					<img
						src={oauthApp.owner.profileImageURL}
						alt={oauthApp.owner.displayName}
						width={20}
						height={20}
					/>
				)}{" "}
				{oauthApp.owner.displayName} (@{oauthApp.owner.displayId})
			</p>
			<p>
				Managers:{" "}
				{oauthApp.managers.map((manager) => (
					<span key={manager.id}>
						{manager.profileImageURL && (
							<img
								src={manager.profileImageURL}
								alt={manager.displayName}
								width={20}
								height={20}
							/>
						)}{" "}
						{manager.displayName} (@{manager.displayId})
						<button
							type="button"
							onClick={handleDeleteManager(manager.displayId ?? "")}
						>
							<ButtonLike>Remove</ButtonLike>
						</button>
					</span>
				))}
				<button type="button" onClick={handleAddManager}>
					<ButtonLike>Add managers</ButtonLike>
				</button>
			</p>
			<button type="button">
				<ButtonLike>Revoke all access tokens</ButtonLike>
			</button>
			<h2>Details</h2>
			<h3>Client ID</h3>
			<p>
				<code>{oauthApp.id}</code>
			</p>
			<h3>Secrets</h3>
			{oauthApp.secrets.map((secret) => {
				const issuedUser = userId2userInfo.get(secret.issuedBy);
				const issuedAt = new Date(secret.issuedAt);
				return (
					<div key={secret.secret}>
						<p>
							<code>{secret.secret}</code>
							{secret.description && <span> ({secret.description})</span>}
							issued by
							{issuedUser ? (
								<>
									{" "}
									{issuedUser.profileImageURL && (
										<img
											src={issuedUser.profileImageURL}
											alt={issuedUser.displayName}
											width={20}
											height={20}
										/>
									)}{" "}
									{issuedUser.displayName} (@{issuedUser.displayId})
								</>
							) : (
								"なんかへんだよ"
							)}
							on
							{issuedAt.toLocaleString()}
						</p>
						<button type="button">
							<ButtonLike>説明を変更</ButtonLike>
						</button>
						<button
							type="button"
							onClick={handleDeleteSecret(secret.secretHash)}
						>
							<ButtonLike>削除</ButtonLike>
						</button>
					</div>
				);
			})}
			<button type="button" onClick={handleGenerateSecret}>
				<ButtonLike>新しい secret を追加する</ButtonLike>
			</button>
			<h2>Edit</h2>
			<form>
				<Form.FieldSet>
					<label htmlFor={appLogoId}>
						<Form.LabelText>Application Logo</Form.LabelText>
					</label>
					{oauthApp.logoUrl ? (
						<img src={oauthApp.logoUrl} alt="Logo" width={100} height={100} />
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
							<Form.Select key={scope.id} value={scope.id} label={scope.name} />
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
		</div>
	);
}
