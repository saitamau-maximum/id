import { factory } from "../../factory";
import { exportKey, generateKeyPair } from "../../utils/oauth/key";

const app = factory.createApp();

const route = app.get("/keygen", async (c) => {
	const { privateKey, publicKey } = await generateKeyPair();
	const exportedPrivkey = await exportKey(privateKey);
	const exportedPubkey = await exportKey(publicKey);
	// 量が量なのでそのまま埋め込んでおきます
	return c.html(
		`
<style>
pre {
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 1em;
  padding: 1em;
  border: 1px solid #ccc;
  box-sizing: border-box;
  user-select: all;
}
</style>
<h1>Key Pair Generator</h1>
<p>リロードすると新しいキーペアが生成されます。 Private Key から Public Key を推論できますが、一応両方控えておいてください。</p>
<h2>Private Key</h2>
<pre>${exportedPrivkey}</pre>
<h2>Public Key</h2>
<pre>${exportedPubkey}</pre>
`.trim(),
	);
});

export { route as oauthUtilRoute };
