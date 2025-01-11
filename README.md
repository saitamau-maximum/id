# Maximum IDP

Maximum IDPは、埼玉大学のプログラミングサークルMaximumのための統一認証基盤・アカウント管理システムです。

<https://id.maximum.vc>

IDPへのログインはGithub OAuthを利用して、[saitamau-maximum](https://github.com/saitamau-maximum)に所属するメンバーがログインできます。

また、IDP自身がOAuth2.0認証サーバーとしての機能を持っており、他のMaximumが提供するサービスに対してIDPを利用した認証を行うことができます。

## Development

### Server

Serverのスキーマの型更新をClientへ反映させるためは、一度ビルドを行う必要があります。

```bash
pnpm build
```

#### 環境変数の設定

公開しても問題ない情報は `wrangler.toml` の `[vars]`, `[env.preview.vars]`, `[env.production.vars]` に設定します。
`[vars]` がローカル開発用、 `[env.preview.vars]` が Preview 環境用、 `[env.production.vars]` が本番環境用です。
各変数の説明を以下に記載します。

- `CLIENT_REDIRECT_URL`: ログイン後にクライアント側にリダイレクトされる URL。
- `CLIENT_ORIGIN`: クライアント側の URL。
- `GITHUB_APP_ID`: GitHub App の ID。 [GitHub App 設定画面](https://github.com/organizations/saitamau-maximum/settings/apps/maximum-auth) から取得できます。 個人の GitHub App を使う場合には適宜変更してください (コミットしないようにお願いします)
- `GITHUB_APP_INSTALLID`: GitHub App の Install ID。 GitHub の REST API を使って取得できます。 詳しくは [公式ドキュメント](https://docs.github.com/ja/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation) を参照してください。
- `GITHUB_OAUTH_ID`: GitHub App の Client ID。 GitHub OAuth の Client ID として使用するため、この名前になっています。 GitHub App 設定画面から取得できます。

機密情報は、 `.dev.vars` に設定します。
このファイルは絶対に公開しないようにしてください。
なお、 `.dev.vars` は `.gitignore` に記載されているため、リポジトリには追加されないようになっています。

`workspaces/server` ディレクトリ内の `.dev.vars.example` を `.dev.vars` という名前でコピーし、変更してください。
各変数の説明を以下に記載します。

- `SECRET`: JWT の署名や Cookie の暗号化に使用する鍵。適当な文字列を設定してください。
- `PRIVKEY_FOR_OAUTH`: OAuth で使用する秘密鍵。 server を立ち上げたら `/oauth/util/keygen` から生成できます。
  - Preview には `` が、 Production には `` の公開鍵に対応する秘密鍵が設定されています。 (あとでかく)
- `GITHUB_APP_PRIVKEY`: GitHub App の秘密鍵。 GitHub App 設定画面の「Generate a private key」で取得し、以下のコードで変換してください。
  - `openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in INPUT_FILE | openssl base64 -A`
  - ダウンロードしたファイルを `INPUT_FILE` に指定してください。
  - Preview には `` が、 Production には `` が設定されています。 (あとでかく)
- `GITHUB_OAUTH_SECRET`: GitHub App の Client Secret。 GitHub OAuth の Client Secret として使用するため、この名前になっています。 GitHub App 設定画面の「Generate a new client secret」から生成してください。
  - Preview には `` が、 Production には `` が設定されています。 (あとでかく)
