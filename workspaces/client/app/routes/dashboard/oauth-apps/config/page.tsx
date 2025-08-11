import { useCallback, useState } from "react";
import { Check, Copy } from "react-feather";
import { useParams } from "react-router";
import { css, cx } from "styled-system/css";
import { UserDisplay } from "~/components/feature/user/user-display";
import { IconButton } from "~/components/ui/icon-button";
import { useAuth } from "~/hooks/use-auth";
import { useToast } from "~/hooks/use-toast";
import { DefaultRepositories } from "~/repository";
import { OAuthSectionHeader } from "../internal/components/oauth-section-header";
import { useApp } from "../internal/hooks/use-apps";
import type { Route } from "./+types/page";
import { AppEditForm } from "./internal/components/app-edit-form";
import { ConfigSectionHeader } from "./internal/components/config-section-header";
import { ConfigSectionSubHeader } from "./internal/components/config-section-sub-header";
import { ManagerEditor } from "./internal/components/manager-editor";
import { SecretsManager } from "./internal/components/secrets-manager";

export const clientLoader = async ({ params }: Route.ClientLoaderArgs) => {
	const { oauthAppId } = params;
	// clientLoader では React Hooks が使えないので、 Repository を直接使用する
	const { oauthAppsRepository } = DefaultRepositories;

	try {
		const data = await oauthAppsRepository.getAppById(oauthAppId);
		return { name: data.name };
	} catch {
		// 取得に失敗した場合、ページは表示できるかもしれないのでエラーは吐かない
		return undefined;
	}
};

export const meta = ({ data }: Route.MetaArgs) => {
	if (!data) {
		// データがない場合はデフォルトのタイトルを返す
		return [{ title: "Maximum IdP" }];
	}
	return [{ title: `${data.name} の設定 | Maximum IdP` }];
};

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

	const [copied, setCopied] = useState(false);
	const { pushToast } = useToast();

	const handleCopyClientId = useCallback(() => {
		if (!oauthApp) return;
		navigator.clipboard.writeText(oauthApp.id);
		setCopied(true);
		pushToast({
			type: "success",
			title: "クライアント ID をコピーしました",
		});
		setTimeout(() => setCopied(false), 3000);
	}, [oauthApp, pushToast]);

	if (!user) return null;
	if (isLoadingApp) return <div>読み込み中...</div>;
	if (!oauthApp) return <div>権限がありません</div>;

	// サーバー側でチェックしているはずだが念のため
	if (oauthApp.managers.every((manager) => manager.id !== user.id))
		return <div>権限がありません</div>;

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
					gridTemplateColumns: "1fr",
					gridTemplateRows: "auto",

					"@dashboard/2xl": {
						gridTemplateColumns: "1fr 1fr",
					},
				})}
			>
				<section className={configSectionStyle}>
					<ConfigSectionHeader>Members</ConfigSectionHeader>
					<ConfigSectionSubHeader title="Owner" />
					<UserDisplay
						displayId={oauthApp.owner.displayId ?? ""}
						name={`${oauthApp.owner.displayName} (@${oauthApp.owner.displayId})`}
						iconURL={oauthApp.owner.profileImageURL ?? ""}
						link
					/>
					<ManagerEditor
						id={oauthApp.id}
						ownerId={oauthApp.owner.id}
						managers={oauthApp.managers}
					/>
				</section>
				<section className={configSectionStyle}>
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
							{copied ? (
								<Check size={16} className={css({ color: "green.600" })} />
							) : (
								<Copy size={16} />
							)}
						</IconButton>
					</div>
					<SecretsManager appId={oauthApp.id} secrets={oauthApp.secrets} />
				</section>
				<section
					className={cx(
						configSectionStyle,
						css({
							gridColumn: "1 / -1",
						}),
					)}
				>
					<ConfigSectionHeader>Edit</ConfigSectionHeader>
					<AppEditForm id={oauthAppId} appData={oauthApp} />
				</section>
			</div>
		</div>
	);
}
