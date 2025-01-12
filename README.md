# Maximum IDP

Maximum IDP は、埼玉大学のプログラミングサークル Maximum のための統一認証基盤・アカウント管理システムです。

<https://id.maximum.vc>

IDP へのログインは GitHub OAuth を利用して、 [saitamau-maximum](https://github.com/saitamau-maximum) に所属するメンバーがログインできます。

また、 IDP 自身が OAuth2.0 認証サーバーとしての機能を持っており、他の Maximum が提供するサービスに対して IDP を利用した認証を行うことができます。

## Development

### Server

Server のスキーマの型更新を Client へ反映させるためは、一度ビルドを行う必要があります。

```bash
pnpm build
```

初期セットアップ時には、マイグレーションと初期データの投入を行う必要があります。

```bash
cd workspaces/server
pnpm apply:migrations:local
pnpm apply:seed:local
```

開発サーバーを立ち上げるには以下のコマンドを実行します。
これは、 `workspaces/server` ディレクトリではなく、ルートディレクトリで実行してください。

```bash
pnpm dev
```

#### 開発環境の設定 (はじめに設定が必要)

`workspaces/client` ディレクトリ内の `.env.example` を `.env` という名前でコピーします。基本的に変更する必要はありません。

> [!IMPORTANT]
> 機密情報は、 `workspaces/server/.dev.vars` に設定します。
> このファイルは絶対に公開しないようにしてください。
> なお、 `.dev.vars` は `.gitignore` に記載されているため、リポジトリには追加されないようになっています。

`workspaces/server` ディレクトリ内の `.dev.vars.example` を `.dev.vars` という名前でコピーし、変更してください。
各変数の説明を以下に記載します。

- `SECRET`: JWT の署名や Cookie の暗号化に使用する鍵
  - `openssl rand -base64 32` が便利です。
  - 適当な文字列を設定してください。
- `PRIVKEY_FOR_OAUTH`: OAuth で使用する秘密鍵
  - `pnpm dev` でサーバーを立ち上げ、<http://localhost:8787/oauth/util/keygen> へブラウザでアクセスして生成してください。
- `GITHUB_APP_PRIVKEY`: GitHub App の秘密鍵
  - [GitHub App 設定画面](https://github.com/organizations/saitamau-maximum/settings/apps/maximum-auth)の「Generate a private key」で取得し、以下のコードで変換してください。
  - `openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in INPUT_FILE | openssl base64 -A`
  - ダウンロードしたファイルを `INPUT_FILE` に指定してください。
- `GITHUB_OAUTH_SECRET`:　 GitHub App の Client Secret
  - [GitHub OAuth Apps 設定画面](https://github.com/settings/developers) に行って、「New OAuth App」から自身の OAuth App を作成してください。
  - Application name, Homepage URL は適当に設定してよいです。 Authorization callback URL には `http://localhost:8787/auth/login/github/callback` を設定してください。
  - 作成できたら、 Client Secret を生成してコピーしてください。
- `GITHUB_OAUTH_ID`: ↑ の OAuth App を作成した際に表示される Client ID を設定してください。

#### 環境変数の設定 (基本的に触る必要なし)

公開しても問題ない情報は `wrangler.toml` の `[vars]`, `[env.preview.vars]`, `[env.production.vars]` に設定します。
`[vars]` がローカル開発用、 `[env.preview.vars]` が Preview 環境用、 `[env.production.vars]` が本番環境用です。
各変数の説明を以下に記載します。

- `CLIENT_REDIRECT_URL`: ログイン後にクライアント側にリダイレクトされる URL。
- `CLIENT_ORIGIN`: クライアント側の URL。
- `GITHUB_APP_ID`: GitHub App の ID。 [GitHub App 設定画面](https://github.com/organizations/saitamau-maximum/settings/apps/maximum-auth) から取得できます。 個人の GitHub App を使う場合には適宜変更してください。
- `GITHUB_APP_INSTALLID`: GitHub App の Install ID。 GitHub の REST API を使って取得できます。 詳しくは [公式ドキュメント](https://docs.github.com/ja/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation) を参照してください。
- `GITHUB_OAUTH_ID`: GitHub App の Client ID。 GitHub OAuth の Client ID として使用するため、この名前になっています。 GitHub App 設定画面から取得できます。

> [!NOTE]
> `.dev.vars` に同じ変数名のものがあると、 `.dev.vars` の値が優先されます。
> そのため、ローカル開発時にこちらの値を変更したい場合には、 `.dev.vars` に設定してください。

## 機密情報のメモ

Cloudflare に格納されている機密情報のメモです。
機密情報そのものは載せません。

### Preview

- `PRIVKEY_FOR_OAUTH`: 公開鍵 `eyJrdHkiOiJFQyIsImtleV9vcHMiOlsidmVyaWZ5Il0sImV4dCI6dHJ1ZSwiY3J2IjoiUC01MjEiLCJ4IjoiQUU1NnZaQnFZT0hXUHIwc3ZUNWtZYzY4dE91WGF2MHdETTZBWGgwakNUZWtkWlNLcVM5YkpUTVZrSW1FRGdTR0E4VV92VGpBZmkzUXhXdlFpcVZGU2Z1TyIsInkiOiJBY2VTUWJlWEk5aF91T3g3c3R6a09relZwMXJFY2pmei1KZm5BeGx2cHlla2tVc2xxZEVBc0x1UGREajhDUi14bEtWcnE4c0hubERtcmNvdWJWWTFhanFsIn0=` に対応する秘密鍵
- `GITHUB_APP_PRIVKEY`: `SHA256:EFPNG0jKzbvrAs7bwo7KHlwBCaXSY2EZIGUx0mRjapM=`
- `GITHUB_OAUTH_SECRET`: `*****4878cfc6`

### Production

- `PRIVKEY_FOR_OAUTH`: 公開鍵 `eyJrdHkiOiJFQyIsImtleV9vcHMiOlsidmVyaWZ5Il0sImV4dCI6dHJ1ZSwiY3J2IjoiUC01MjEiLCJ4IjoiQVRhVVZJVEFHaWFsN1ZvNmdmaXlZajdjUlZnOUVmUXJxNk9rTHFUYnpaTHdTZUhDUTNxZEE5U2VMZDVneTR3ajNILS1FQXI2OGpXc3lZZ3hzT2F4cWlUZiIsInkiOiJBQnRyMjFaLW9RVWFqSlc1bkU3Q1l4R1ZQYVdkWGZjOWtZcEZjeE1XbmJSX2s3Q1N3b2tMOWN5eGptR3JTcDJIUVpMeXh3NXd1MEJuN09NV0pHWWpNd0lxIn0=` に対応する秘密鍵
- `GITHUB_APP_PRIVKEY`: `SHA256:wowbG0gmps60OuYv+g7hCqxUN6cBA7RFWmR/VH4tShI=`
- `GITHUB_OAUTH_SECRET`: `*****d68c2227`
