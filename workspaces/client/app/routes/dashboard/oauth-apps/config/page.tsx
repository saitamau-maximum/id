import { useMemo } from "react";
import { ChevronLeft } from "react-feather";
import { Link, useParams } from "react-router";
import { AnchorLike } from "~/components/ui/anchor-like";
import { ButtonLike } from "~/components/ui/button-like";
import { useAuth } from "~/hooks/use-auth";
import type { UserBasicInfo } from "~/repository/oauth-apps";
import { useApp } from "../internal/hooks/use-apps";

export default function Config() {
	const { oauthAppId } = useParams<{ oauthAppId: string }>();

	if (!oauthAppId) return null;

	const { user } = useAuth();
	const { data: oauthApp, isLoading: isLoadingApp } = useApp(oauthAppId);

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
					</span>
				))}
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
							<ButtonLike>削除</ButtonLike>
						</button>
					</div>
				);
			})}
			<button type="button">
				<ButtonLike>新しい secret を追加する</ButtonLike>
			</button>
			<h2>Edit</h2>
			<form>
				Application Logo
				{oauthApp.logoUrl ? (
					<img src={oauthApp.logoUrl} alt="Logo" width={100} height={100} />
				) : (
					"No Image"
				)}
				<button type="button">
					<ButtonLike>Upload new logo</ButtonLike>
				</button>
				<br />
				Application Name
				<input name="name" type="text" value={oauthApp.name} required />
				<br />
				Application Description
				<textarea name="description" value={oauthApp.description ?? ""} />
				<br />
				Scopes
				<ul>
					{oauthApp.scopes.map((scope) => (
						<li key={scope.id}>
							{scope.name}
							{scope.description && <span> ({scope.description})</span>}
						</li>
					))}
				</ul>
				(追加するボタン)
				<br />
				Callback URLs
				<ul>
					{oauthApp.callbackUrls.map((callbackUrl) => (
						<li key={callbackUrl}>{callbackUrl}</li>
					))}
				</ul>
				(編集と追加)
				<button type="submit">
					<ButtonLike>Save</ButtonLike>
				</button>
			</form>
		</div>
	);
}
