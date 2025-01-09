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
