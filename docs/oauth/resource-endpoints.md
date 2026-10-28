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
interface UserInfo {
	id: string;
	display_id: string | undefined;
	display_name: string | undefined;
	profile_image_url: string | undefined;
	roles: string[];
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
// openid scope がついている場合:
interface OIDCBasicUserInfo {
	sub: string;
	updated_at?: number;
}

// profile scope がついている場合、以下の情報も返されます
interface OIDCProfile {
	name: string | undefined;
	given_name: string | undefined;
	family_name: string | undefined;
	nickname: string | undefined;
	preferred_username: string | undefined;
	profile: undefined; // 未完成の public profile へのリンクを返す予定
	picture: string | undefined; // URL
	website: string | undefined; // URL
	gender: undefined; // 情報を持ってないし持つつもりもないです
	birthdate: undefined; // 情報を持っていません
	zoneinfo: "Asia/Tokyo"; // 現状固定しているが、後に変わるかも
	locale: "ja-JP"; // 現状固定しているが、後に変わるかも
}

// email scope がついている場合、以下の情報も返されます
interface OIDCEmail {
	email: string | undefined;
	email_verified: false; // 現在メールアドレス検証していないので常に false です
}

// read:roles scope がついている場合、以下の情報も返されます
interface OIDCRoles {
	roles: string[];
}
```
