# Resource Endpoints

OAuth の Resource Owner としてのエンドポイント一覧

OAuth で認証して Access Token を得たら、ここの API を使えるようになるよ～みたいな感じでとらえてもらえれば

## 共通仕様

- URL の prefix として `https://api.id.maximum.vc/oauth/resources` をつけてください
  - 例えば、 `GET /authuser` なら `https://api.id.maximum.vc/oauth/resources/authuser` に GET を投げてください
- Header に含めてください:

  ```http
  Authorization: Bearer [取得した Access Token]
  ```

## GET `/authuser`

Access Token に紐づくユーザーの基本情報を取得します。

Scopes Needed:
- `read:basic_info`

Returns:

```ts
{
  id: string,                 // 内部ユーザー ID
  display_id: string,         // @ID
  display_name: string,       // ユーザー表示名
  profile_image_url: string,  // プロフィール写真 URL
  roles: string[],            // ユーザーに割り当てられている Role slug (admin, member, accountant, ...)
}
```

## GET, POST `/userinfo`

Access Token に紐づくユーザーの基本情報を、 OIDC の UserInfo Endpoint 仕様に従って取得します。

Scopes Needed:
- `openid`

Scopes Optional:
- `profile`
- `email`
- `read:roles`

Returns:

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

  // read:roles scope が存在している場合に含まれる情報
  roles?: string[],  // ユーザーに割り当てられている Role slug (admin, member, accountant, ...)
}
```
