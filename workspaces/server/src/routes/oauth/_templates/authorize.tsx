import { Fragment } from "hono/jsx";
import type { NonNullableFC } from "../../../utils/types";
import { _Button } from "./button";

interface AuthorizeProps {
	appName: string;
	appLogo: string | null;
	scopes: { name: string; description: string | null }[];
	oauthFields: {
		clientId: string;
		responseType: string;
		responseMode?: string;
		// client が指定してきた redirect_uri
		redirectUri?: string;
		// client が指定してきた redirect_uri または DB に保存されている callback
		redirectTo: string;
		scope?: string;
		state?: string;
		oidcNonce?: string;
		oidcAuthTime?: number;
		token: string;
		nowUnixMs: number;
	};
	user: {
		displayName: string;
		profileImageUrl: string | null;
	};
}

export const _Authorize: NonNullableFC<AuthorizeProps> = ({
	appName,
	appLogo,
	scopes,
	oauthFields,
	user,
}) => (
	<Fragment>
		<div className="max-w-md md:space-y-8 space-y-4">
			<div>
				<div className="flex items-center justify-center gap-4 md:mb-2">
					{appLogo && (
						<img
							src={appLogo}
							alt={`${appName} のロゴ`}
							width="64"
							height="64"
							className="rounded-full object-cover border-[1px] border-gray-200 md:w-[64px] md:h-[64px] w-[48px] h-[48px]"
						/>
					)}
					<h1 className="text-3xl font-bold text-center">{appName}</h1>
				</div>
				<span className="block text-lg font-normal text-gray-600 text-center">
					を承認しますか？
				</span>
			</div>
			<div className="md:space-y-6 space-y-4">
				<p className="text-md text-gray-800 text-center">
					承認すると {appName} は以下の情報にアクセスできるようになります。
				</p>
				<div className="bg-gray-50 md:p-4 p-2 rounded-lg">
					<table className="border-collapse table-auto w-full text-sm">
						<tbody>
							{scopes.map((data) => (
								<tr
									key={data.name}
									className="[&:not(:last-child)]:border-b-[1px] border-gray-200"
								>
									<td className="px-4 py-2 font-medium">{data.name}</td>
									<td className="px-4 py-2 font-normal text-gray-500">
										{data.description}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<form method="post" action="/oauth/callback" className="space-y-4">
					<input type="hidden" name="client_id" value={oauthFields.clientId} />
					<input
						type="hidden"
						name="response_type"
						value={oauthFields.responseType}
					/>
					{oauthFields.responseMode && (
						<input
							type="hidden"
							name="response_mode"
							value={oauthFields.responseMode}
						/>
					)}
					{oauthFields.redirectUri && (
						<input
							type="hidden"
							name="redirect_uri"
							value={oauthFields.redirectUri}
						/>
					)}
					{oauthFields.scope && (
						<input type="hidden" name="scope" value={oauthFields.scope} />
					)}
					{oauthFields.state && (
						<input type="hidden" name="state" value={oauthFields.state} />
					)}
					{oauthFields.oidcNonce && (
						<input
							type="hidden"
							name="oidc_nonce"
							value={oauthFields.oidcNonce}
						/>
					)}
					{oauthFields.oidcAuthTime && (
						<input
							type="hidden"
							name="oidc_auth_time"
							value={oauthFields.oidcAuthTime.toString()}
						/>
					)}
					<input type="hidden" name="time" value={oauthFields.nowUnixMs} />
					<input type="hidden" name="auth_token" value={oauthFields.token} />
					<div className="flex justify-around gap-4">
						<_Button
							variant="primary"
							type="submit"
							name="authorized"
							value="1"
						>
							承認する
						</_Button>
						<_Button
							variant="secondary"
							type="submit"
							name="authorized"
							value="0"
						>
							拒否する
						</_Button>
					</div>
				</form>
			</div>
			<p className="text-sm text-gray-600 text-center">
				{new URL(oauthFields.redirectTo).origin} へリダイレクトします。
				このアドレスが意図しているものか確認してください。
			</p>
		</div>
		<div className="flex items-center justify-center flex-wrap gap-2 absolute top-4 left-0 right-0">
			{user.profileImageUrl && (
				<img
					src={user.profileImageUrl}
					alt={`${user.displayName} のアイコン`}
					width="32"
					height="32"
					className="rounded-full object-cover border-[1px] border-gray-200"
				/>
			)}
			<span className="md:text-lg text-gray-600 font-bold">
				{user.displayName}
			</span>
			<span className="md:text-sm text-xs text-gray-600">
				さんとしてログインしています。
			</span>
		</div>
	</Fragment>
);
