# Maximum IdP を用いた OAuth

必要最低限のことだけ書いておきます

## 仕様

- OAuth2 に準拠しているはずです
  - Authorization Code Grant のみ対応しています
  - Dynamic Registration には対応していません
- OpenID Connect にも対応しています

## Scopes

現在 Maximum IdP OAuth で定義されている Scope は以下の通りです。
なお、最新版や説明などは [/workspaces/schema/src/entity/oauth-external/scope.ts](../../workspaces/schema/src/entity/oauth-external/scope.ts) に定義されています。
- `read:basic_info`
- `read:roles`
- `openid`
- `profile`
- `email`

## 各種エンドポイント

### Authorization endpoint

ここに飛ばされてユーザーが認可/拒否を決定します。

```http
GET https://api.id.maximum.vc/oauth/authorize
```

### Token endpoint

OAuth Client は `code` を受け取ると、ここに必要情報を送信して Access token を受け取ります。

```http
POST https://api.id.maximum.vc/oauth/access-token
```

`openid` scope を含んでいる場合、以下の情報を含む JWT が `id_token` フィールドに付与されます。
使用アルゴリズムは `ES512` です。

```ts
{
  iss: string,        // issuer: "https://api.id.maximum.vc" 固定です
  sub: string,        // ClientID, UserId の SHA512 ハッシュ
  aud: string[],      // Client ID が入っています
  exp: number,        // 有効期限 (Unix 秒)
  iat: number,        // 発行日時
  at_hash: string,    // Access Token のハッシュ
  nonce?: string,     // Authorization Endpoint に渡された nonce
  authTime?: number,  // ユーザーの最終認証日時
}
```

### JWKs URI (OpenID Connect)

JWT の署名に使われた秘密鍵に対応する、公開鍵の情報が書かれたエンドポイントです。

```http
GET https://api.id.maximum.vc/oauth/jwks
```

### Discovery endpoint (OpenID Connect)

OpenID Connect の設定が書かれています。

```http
GET https://api.id.maximum.vc/.well-known/openid-configuration
```

## Resource Endpoint

受け取った Access Token を用いて各種情報を取得できます。
`Authorization: Bearer <accessToken>` ヘッダを付与してください。

### Authuser

Access Token に紐づくユーザーの情報を取得します。
`read:basic_info` scope が必要です。

```http
GET https://api.id.maximum.vc/oauth/resources/authuser
```

以下の情報が返ってきます。
ロールについては [/workspaces/schema/src/entity/role.ts](../../workspaces/schema/src/entity/role.ts) を参照してください。

```ts
{
  id: string,                 // 内部ユーザー ID
  display_id: string,         // @ID
  display_name: string,       // ユーザー表示名
  profile_image_url: string,  // プロフィール写真 URL
  roles: string[],            // ユーザーに割り当てられている Role slug (admin, member, accountant, ...)
}
```

### Userinfo

OpenID Connect 向け、 Access Token に紐づくユーザーの情報を取得します。
`openid` scope が必要です。

```http
GET https://api.id.maximum.vc/oauth/resources/userinfo
POST https://api.id.maximum.vc/oauth/resources/userinfo
```

以下の情報が返ってきます。

```ts
{
  // すべてのリクエストで含まれる情報
  sub: string,          // id_token の sub と同じ値
  updated_at?: number,  // IdP 上の Settings でユーザー情報が更新された日時

  // profile scope が存在している場合に含まれる情報
  name?: string,                // 本名
  family_name?: string,         // 名字
  given_name?: string,          // 名前
  nickname?: string,            // 表示名
  preferred_username?: string,  // @ID
  picture?: string,             // プロフィール写真 URL
  website?: string,             // SocialLinks の一番上に設定されている URL
  zoneinfo: string,             // "Asia/Tokyo" (現状固定)
  locale: string,               // "ja-JP" (現状固定)

  // email scope が存在している場合に含まれる情報
  email?: string,           // 連絡の取れるメールアドレス
  email_verified: boolean,  // false (現状固定)
}
```
