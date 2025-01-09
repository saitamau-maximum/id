import { html } from "hono/html";
import { _Button } from "../../_templates/button";

interface AuthorizeProps {
	appName: string;
	appLogo: string | null;
	scopes: { name: string; description: string | null }[];
	oauthFields: {
		clientId: string;
		// client が指定してきた redirect_uri
		redirectUri?: string;
		// client が指定してきた redirect_uri または DB に保存されている callback
		redirectTo: string;
		state?: string;
		scope?: string;
		token: string;
		nowUnixMs: number;
	};
	user: {
		displayName: string;
		profileImageUrl: string | null;
	};
}

export const _Authorize = ({
	appName,
	appLogo,
	scopes,
	oauthFields,
	user,
}: AuthorizeProps) => html`
  <div class="max-w-md md:space-y-8 space-y-4">
    <div>
      <div class="flex items-center justify-center gap-4 md:mb-2">
        ${
					appLogo
						? html`<img
              src="${appLogo}"
              alt="${appName} のロゴ"
              width="64"
              height="64"
              class="rounded-full object-cover border-[1px] border-gray-200 md:w-[64px] md:h-[64px] w-[48px] h-[48px]"
            />`
						: ""
				}
        <h1 class="text-3xl font-bold text-center">${appName}</h1>
      </div>
      <span class="block text-lg font-normal text-gray-600 text-center">
        を承認しますか？
      </span>
    </div>
    <div class="md:space-y-6 space-y-4">
      <p class="text-md text-gray-800 text-center">
        承認すると ${appName} は以下の情報にアクセスできるようになります。
      </p>
      <div class="bg-gray-50 md:p-4 p-2 rounded-lg">
        <table class="border-collapse table-auto w-full text-sm">
          <tbody>
            ${scopes.map(
							(data) => html`
                <tr class="[&:not(:last-child)]:border-b-[1px] border-gray-200">
                  <td class="px-4 py-2 font-medium">${data.name}</td>
                  <td class="px-4 py-2 font-normal text-gray-500">
                    ${data.description}
                  </td>
                </tr>
              `,
						)}
          </tbody>
        </table>
      </div>
      <form method="POST" action="/oauth/callback" class="space-y-4">
        <input type="hidden" name="client_id" value="${oauthFields.clientId}" />
        ${
					oauthFields.redirectUri
						? html`<input
              type="hidden"
              name="redirect_uri"
              value="${oauthFields.redirectUri}"
            />`
						: ""
				}
        ${
					oauthFields.state
						? html`<input
              type="hidden"
              name="state"
              value="${oauthFields.state}"
            />`
						: ""
				}
        ${
					oauthFields.scope
						? html`<input
              type="hidden"
              name="scope"
              value="${oauthFields.scope}"
            />`
						: ""
				}
        <input type="hidden" name="time" value="${oauthFields.nowUnixMs}" />
        <input type="hidden" name="auth_token" value="${oauthFields.token}" />
        <div class="flex justify-around gap-4">
          ${_Button({
						text: "承認する",
						variant: "primary",
						type: "submit",
						name: "authorized",
						value: "1",
					})}
          ${_Button({
						text: "拒否する",
						variant: "secondary",
						type: "submit",
						name: "authorized",
						value: "0",
					})}
        </div>
      </form>
    </div>
    <p class="text-sm text-gray-600 text-center">
      ${new URL(oauthFields.redirectTo).origin} へリダイレクトします。
      このアドレスが意図しているものか確認してください。
    </p>
  </div>
  <div
    class="flex items-center justify-center flex-wrap gap-2 absolute top-4 left-0 right-0"
  >
    ${
			user.profileImageUrl
				? html`<img
          src="${user.profileImageUrl}"
          alt="${user.displayName} のアイコン"
          width="32"
          height="32"
          class="rounded-full object-cover border-[1px] border-gray-200"
        />`
				: ""
		}
    <span class="md:text-lg text-gray-600 font-bold">${user.displayName}</span>
    <span class="md:text-sm text-xs text-gray-600"
      >さんとしてログインしています。</span
    >
  </div>
`;
