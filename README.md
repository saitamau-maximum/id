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

`workspaces/server` ディレクトリ内の `.dev.vars.example` を `.dev.vars` という名前でコピーしてください。
各変数の説明を以下に記載します。

- `JWT_SECRET`: JWT の署名に使用する鍵。適当な文字列を設定してください。
- `PRIVKEY_FOR_OAUTH`: OAuth で使用する秘密鍵。 server を立ち上げたら `/oauth/util/keygen` から生成できます。
