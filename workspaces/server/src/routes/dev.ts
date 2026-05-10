import { factory } from "../factory";
import { noCacheMiddleware } from "../middleware/cache";

const app = factory.createApp();

// どうせここでしか使わないので middleware には置かない
const onlyDevMiddleware = factory.createMiddleware(async (c, next) => {
	if (c.env.ENV !== "development") {
		return c.text("Not found", 404);
	}
	return next();
});

const route = app
	.use(onlyDevMiddleware)
	.get("/oauth/:clientId/:clientSecret", (c) => {
		const { clientId, clientSecret } = c.req.param();
		const redirectTo = new URL(c.req.url);
		redirectTo.pathname = "/oauth/authorize";
		redirectTo.searchParams.set("response_type", "code");
		redirectTo.searchParams.set("client_id", clientId);
		redirectTo.searchParams.set(
			"redirect_uri",
			`${redirectTo.origin}/dev/oauth/${clientId}/${clientSecret}/callback`,
		);
		return c.redirect(redirectTo.toString(), 302);
	})
	.get(
		"/oauth/:clientId/:clientSecret/callback",
		noCacheMiddleware,
		async (c) => {
			const { clientId, clientSecret } = c.req.param();
			const { code } = c.req.query();
			if (!code) {
				return c.text("Bad Request: code is required", 400);
			}
			const url = new URL(c.req.url);
			const body = new FormData();
			body.append("grant_type", "authorization_code");
			body.append("code", code);
			body.append(
				"redirect_uri",
				`${url.origin}/dev/oauth/${clientId}/${clientSecret}/callback`,
			);

			const res = await fetch(`${url.origin}/oauth/access-token`, {
				method: "POST",
				body,
				headers: {
					Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, // client_id と client_secret は Basic 認証で送る
				},
			});
			const resj = await res.json();
			return c.json(resj as Record<string, unknown>, 200);
		},
	)
	.get("/webhook/github", (c) => {
		const WEBHOOK_TARGET = "/webhook/github";
		const GITHUB_APP_SETTING_URL =
			"https://github.com/organizations/saitamau-maximum/settings/apps/maximum-idp-dev";

		return c.html(
			`<h1>GitHub Webhook Test</h1>
<ol>
  <li><code>README.md</code> を読んで、 <code>GITHUB_WEBHOOK_SECRET</code> を設定してください。</li>
	<li><a href="https://smee.io/" target="_blank">smee.io</a> から Start a new channel を押し、出てきた Webhook Proxy URL を下のテキストボックスに貼り付けてください。</li>
	<li><a href="${GITHUB_APP_SETTING_URL}" target="_blank">GitHub App 設定画面</a> で、 Webhook URL を 2. で取得した URL、 Secret を 1. で設定した値にしてください。</li>
	<li>下の Start ボタンを押すと、転送が開始されます。 GitHub で何かイベントが発生すると、ここに内容が表示されるはずです。</li>
</ol>
<p>注意: Webhook 設定を変更する際は、ほかに作業している人がいないことを確認してください。 また、変更する GitHub App Name に「Dev」が含まれていることを確認してください。</p>
<hr />
<input type="text" id="smeeUrl" placeholder="smee.io で取得した Webhook Proxy URL を入力" style="width: 80%;" />
<button id="startBtn">Start</button>
<pre id="output" style="background-color: #f0f0f0; padding: 1em; white-space: pre-wrap;"></pre>
<script>
	const startBtn = document.getElementById("startBtn");
	const smeeUrlInput = document.getElementById("smeeUrl");
	const output = document.getElementById("output");
	let eventSource;
	startBtn.addEventListener("click", () => {
		const smeeUrl = smeeUrlInput.value.trim();
		if (!smeeUrl) {
			alert("smee.io で取得した Webhook Proxy URL を入力してください");
			return;
		}
		if (eventSource) {
			eventSource.close();
			output.textContent += "通信が切断されました\\n\\n";
		}
		eventSource = new EventSource(smeeUrl);
		eventSource.onopen = () => {
			output.textContent += "通信が開始されました\\n\\n";
		};
		eventSource.onmessage = async (event) => {
			const data = JSON.parse(event.data);
			output.textContent += JSON.stringify(data, null, 2) + "\\n\\n";
			// ref: https://github.com/octokit/webhooks.js/#local-development
			const { body, query, timestamp, ...headers } = data;
			await fetch("${WEBHOOK_TARGET}", {
			  method: "POST",
				headers,
				body: JSON.stringify(body),
			});
		};
		eventSource.onerror = (err) => {
			console.error("EventSource failed:", err);
			output.textContent += "通信エラーが発生しました、コンソールを確認してください\\n\\n";
			eventSource.close();
		};
	});
</script>
`.trim(),
		);
	});

export { route as devRoute };
