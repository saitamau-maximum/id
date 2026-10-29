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
  auth_time?: number,  // ユーザーの最終認証日時
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
詳しくは [./resource-endpoints.md](./resource-endpoints.md) を参照してください。
