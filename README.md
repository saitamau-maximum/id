# Maximum IdP

Maximum IdP は、埼玉大学のプログラミングサークル Maximum のための統一認証基盤・アカウント管理システムです。

<https://id.maximum.vc>

[saitamau-maximum](https://github.com/saitamau-maximum) に所属するメンバーは誰でも利用できます。
また、 Admin から招待を受けた方は、 GitHub アカウントを紐づけ、承認を受けることで利用できます。

IdP 自身が OAuth2.0 認証サーバーとしての機能を持っており、他の Maximum が提供するサービスに対して IdP を利用した認証を行うことができます。
詳しくは [リポジトリの Wiki](https://github.com/saitamau-maximum/id/wiki/oauth-docs) を参照してください。

## Development

### 開発環境の設定 (はじめに設定が必要)

> [!IMPORTANT]
> 機密情報は、 `workspaces/client/.env` や `workspaces/server/.dev.vars` に設定します。
> このファイルは絶対に公開しないようにしてください。
> なお、これらのファイルは `.gitignore` に記載されているため、リポジトリには追加されないようになっています。

#### Client

`workspaces/client` ディレクトリ内の `.env.example` を `.env` という名前でコピーします。
基本的に変更する必要はありません。

#### Server

`workspaces/server` ディレクトリ内の `.dev.vars.example` を `.dev.vars` という名前でコピーし、変更します。

必須となる環境変数は以下の通りです。

- `SECRET`: JWT の署名や Cookie の暗号化に使用する鍵
  - 適当な文字列を設定してください。
  - `openssl rand -base64 32` が便利です。
- `GITHUB_APP_PRIVKEY`: GitHub App の秘密鍵
  - [GitHub App 設定画面](https://github.com/organizations/saitamau-maximum/settings/apps/maximum-auth)の「Generate a private key」で取得し、以下のコードで変換してください。
  - `openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in INPUT_FILE | openssl base64 -A`
  - ダウンロードしたファイルを `INPUT_FILE` に指定してください。
- `GITHUB_OAUTH_SECRET`:　 GitHub App の Client Secret
  - [GitHub OAuth Apps 設定画面](https://github.com/settings/developers) に行って、「New OAuth App」から自身の OAuth App を作成してください。
  - Application name, Homepage URL は適当に設定してよいです。 Authorization callback URL には `http://localhost:8787/auth/login/github/callback` を設定してください。
  - 作成できたら、 Client Secret を生成してコピーしてください。
- `GITHUB_OAUTH_ID`: ↑ の OAuth App を作成した際に表示される Client ID を設定してください。

ここから下の環境変数たちは必要に応じて設定してください。

<details>
<summary>IdP OAuth の開発</summary>

- `PRIVKEY_FOR_OAUTH`: IdP OAuth 内で使用する秘密鍵
  - <https://api.id.maximum.vc/oauth/util/keygen> へアクセスして生成してください。

</details>

<details>
<summary>Discord 関連の開発</summary>

- `DISCORD_OAUTH_ID`: Discord OAuth の Client ID
- `DISCORD_OAUTH_SECRET`: Discord OAuth の Client Secret
- `DISCORD_BOT_TOKEN`: Discord Bot のトークン
- `DISCORD_GUILD_ID`: Discord Bot を追加するサーバーの ID
- `DISCORD_CALENDAR_CHANNEL_ID`: Calendar の通知を送信する Discord チャンネルの ID

Discord Developer Portal (<https://discord.com/developers/applications>) から新しくアプリケーションを作成してください。
Bot タブの Public bot を有効にしてから、 Installation タブの Installation Contexts で User Install と Guild Install の両方を有効にしてください。
その後設定画面の OAuth2 タブから Client ID と Client Secret を取得してください。
Redirect URL として、 `http://localhost:8787/auth/login/discord/callback` を設定してください。

Bot を作成する場合、自身の管理するサーバーに Bot を追加してください。
また、 Bot タブから TOKEN を生成してください。
Bot の追加については、 `DISCORD_OAUTH_ID`, `DISCORD_GUILD_ID` を指定したら、 `pnpm dev` を実行し、ブラウザで `http://localhost:8787/discord/add-bot` にアクセスすることで bot を追加できます。
念のため、自分が管理しているサーバーが選択されていることを確認してください。

Guild ID と Channel ID は、ブラウザで Discord を開いたときに URL に表示されます。
`https://discord.com/channels/<Guild ID>/<Channel ID>` です。

</details>

<details>
<summary>その他</summary>

(なし)

</details>

### 環境変数の設定 (基本的に触る必要なし)

公開しても問題ない情報は `wrangler.toml` の `[vars]`, `[env.preview.vars]`, `[env.production.vars]` に設定します。
`[vars]` がローカル開発用、 `[env.preview.vars]` が Preview 環境用、 `[env.production.vars]` が本番環境用です。

各変数の説明を以下に記載します。

- `CLIENT_REDIRECT_URL`: ログイン後にクライアント側にリダイレクトされる URL。
- `CLIENT_ORIGIN`: クライアント側の URL。
- `GITHUB_APP_ID`: GitHub App の ID。 [GitHub App 設定画面](https://github.com/organizations/saitamau-maximum/settings/apps/maximum-auth) から取得できます。 個人の GitHub App を使う場合には適宜変更してください。
- `GITHUB_APP_INSTALLID`: GitHub App の Install ID。 GitHub の REST API を使って取得できます。 詳しくは [公式ドキュメント](https://docs.github.com/ja/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation) を参照してください。

> [!TIP]
> `.dev.vars` に同じ変数名のものがあると、 `.dev.vars` の値が優先されます。
> そのため、ローカル開発時にこちらの値を変更したい場合には、 `.dev.vars` に設定してください。

### 初期セットアップ

> [!NOTE]
> これらのコマンドはプロジェクトのルートディレクトリで実行してください。

依存関係をインストールします。このコマンドにより、pre-commit フックも自動的にセットアップされます。

```bash
pnpm install
```

初期セットアップ時には、マイグレーションを行う必要があります。

```bash
pnpm apply:migrations:local
```

また、 Server のスキーマの型更新を Client へ反映させるために、一度ビルドを行う必要があります。
こちらは Server 側に変更が加わった際には毎回行ってください。

```bash
pnpm -C workspaces/server run build
```

### 開発サーバーの立ち上げ

開発サーバーを立ち上げるには以下のコマンドを実行します。

```bash
pnpm dev
```

Cron Triggers のテストを行いたい場合、 `pnpm dev` 後にブラウザで `localhost:8787/dev/cron` にアクセスすると簡単に発火できます。

### Pre-commit フック

このプロジェクトでは、コード品質を保つために pre-commit フックが設定されています。

#### 自動セットアップ

`pnpm install` 実行時に自動的にセットアップされます。手動での設定は不要です。

#### 動作

- コミット時に `lint-staged` が実行されます
- ステージングされたファイルのみに対して Biome による自動修正が実行されます
- 修正不可能なエラーがある場合、コミットがブロックされます
- 自動修正されたファイルは再度ステージングする必要があります

#### 対象ファイル

以下の拡張子のファイルが対象となります：
- JavaScript/TypeScript: `.js`, `.jsx`, `.ts`, `.tsx`
- その他: `.json`, `.css`, `.md`

#### トラブルシューティング

フックが正常に動作しない場合は、以下を確認してください：

```bash
# フックファイルの実行権限を確認
ls -la .husky/pre-commit

# 必要に応じて実行権限を付与
chmod +x .husky/pre-commit
```

## 機密情報のメモ

Cloudflare に格納されている機密情報のメモ。
開発時には特に気にしなくてよいです。
<https://github.com/saitamau-maximum/id/wiki/credentials-memo> を参照してください。
