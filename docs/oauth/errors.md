# OAuth で出るエラーについて

Server Error や 405 Method Not Allowed は除いています

## Authorization Endpoint

> [!TIP]
> Bad Request 系のエラーは OAuth Client 側にリダイレクトされません。
> OAuth Resource Owner (= OAuth で「同意する」「拒否する」を選ぶユーザー) 側でこのエラーが表示されます。
>
> それ以外のエラーは、クエリパラメータで指定 または IdP システムに登録 された redirect_uri に対して、クエリパラメータに `error`, `error_description`, `error_uri`, `state` が付与されてリダイレクトされます。

### Owner が「同意する」「拒否する」を選ぶ前に出るエラー

#### Bad Request: invalid client_id

`client_id` がクエリパラメータに存在しないか、複数存在しているようです。
クエリパラメータを確認してください。

#### Bad Request: client_id not registered

`client_id` が IdP システムで登録されていません。
<https://id.maximum.vc/oauth-apps> に登録されているか確認してください。

#### Bad Request: invalid redirect_uri

以下のいずれかの理由で、クエリパラメータで指定された `redirect_uri` が不正です。
- `redirect_uri` がクエリパラメータに複数存在しているようです。
  クエリパラメータを確認してください。

- クエリパラメータで指定された `redirect_uri` は絶対 URI (`https://example.com/foo/bar` の形) ではないようです。
  相対 URL (`./foo/bar` の形) になっていないか確認してください。

#### Bad Request: redirect_uri not registered

- `redirect_uri` がクエリパラメータで渡されていないうえ、 IdP システム上でも登録されていません。
  クエリパラメータに `redirect_uri` を付与するか、 IdP システム上で登録してください。

- クエリパラメータで指定された `redirect_uri` は、 IdP システム上で登録されているどの URI とも異なっています。
  セキュリティ上のリスクがあるため、続行させるわけにはいきません。
  IdP システム上での URI に登録されているか確認してください。
  なお、 `redirect_uri` 内のクエリパラメータ (`?foo=bar`) は登録されているものと異なっていても問題ありません。

#### Bad Request: ambiguous redirect_uri

`redirect_uri` がクエリパラメータで渡されていませんが、 IdP システム上では複数登録されています。
クエリパラメータに `redirect_uri` を付与してください。

#### Bad Request: too many state

クエリパラメータで指定されている `state` が複数存在しているようです。
クエリパラメータを確認してください。

#### invalid_request: response_type required

クエリパラメータで `response_type` が指定されていません。

#### unsupported_response_type: only 'code' is supported

IdP では `response_type=code` (Authorization Code Flow) のみがサポートされています。
それ以外を使用したい場合、その理由を書いて Issue に投げてください。

#### invalid_scope: invalid scope

`scope` の形式が異なっています。
[/workspaces/schema/src/entity/oauth-external/scope.ts](../../workspaces/schema/src/entity/oauth-external/scope.ts) の `SCOPES_BY_ID` に定義されている `name` をスペース区切りで列挙してください。

#### invalid_scope: there are duplicates in scopes

そのまんまですが、指定されている `scope` に重複があります。
重複を取り除いてください。

#### invalid_scope: non-registered scope(s): foo, bar

`foo`, `bar`, ... は IdP システム上で設定されている以上の権限を要求しています。
OAuth アプリ管理画面で、 scope の設定を更新してください。

#### invalid_scope: there must be at least one scope specified

ほぼ起きないはずですが、 (IdP で設定されている) かつ (`scope` で定義されている) ようなものが存在しないことを表します。
クエリパラメータや IdP システム上での scope 設定を見直してください。

### OpenID Connect 関連のエラー

#### invalid_request: invalid nonce

`nonce` が string じゃないみたいです。
そんなことありますか？

#### invalid_request: invalid prompt

`prompt` は `none`, `login`, `consent`, `select_account` のみ対応しています。

#### invalid_request: invalid max_age

`max_age` が整数値ではないようです。
最終認証時刻からの秒数を指定しましょう。

#### invalid_request: invalid response_mode

`response_mode` は `query`, `fragment` のみ対応しています。

#### invalid_request: response_mode='fragment' is not allowed when response_type='code'

そのまんまです。

#### invalid_request: redirect_uri required for OpenID Connect Implicit Flow

そのまんまです。
仕様で定められているので従ってください。

#### invalid_request: redirect_uri not registered for OpenID Connect Implicit Flow

そのまんまです。
仕様で定められているので従ってください。

#### invalid_request: redirect_uri must be https for OpenID Connect Implicit Flow

そのまんまです。
仕様で定められているので従ってください。

#### interaction_required: End-User must consent to use OpenID Connect

`prompt=none` にしている場合に起こります。
未対応なので別の値を指定してください。

#### request_not_supported: request parameter is not supported

はい

### 「同意する」「拒否する」を選んだ後に出るエラー

#### Bad Request: invalid auth_token

Owner がリクエストを改変した可能性があります。

#### Bad Request: authorization request expired

5 分以内に「同意する」「拒否する」を選択されませんでした。

#### access_denied: The user denied the request

Resource Owner が認可しなかったことを表しています。

## Access Token Endpoint

> [!TIP]
> エラーが起きなかった場合、以下の内容が JSON でレスポンスとして返されます。

<!-- markdownlint-disable-next-line MD001 -->
#### invalid_request: Missing client_id or client_secret

POST body に `client_id`, `client_secret` が含まれておらず、リクエストヘッダにも `Authorization: Basic <token>` が付与されていないようです。
どちらかの方法で指定してください。

#### invalid_request: Invalid Authorization Header

リクエストヘッダの `Authorization: Basic <token>` の形式がおかしいみたいです。
`<client_id>:<client_secret>` を Base64 エンコードしたものを指定しているか確認してください。

#### invalid_request: Invalid Parameters

パラメータがおかしいみたいです。

```ts
grant_type: string
code: string
redirect_uri?: URL
client_id: string
client_secret: string
```

を FormData で送ってください。

#### invalid_grant: Invalid Code (Not Found, Expired, etc)

Code が正しくないようです。
Authorization Endpoint からの callback で得られた `code` をそのまま入れてください。
そのまま入れている場合は、期限切れになっている可能性があります。
Callback から 1 分以内に Access Token Request を送ってください。

#### invalid_request: Redirect URI mismatch

`redirect_uri` が Authorization Endpoint で指定されたものと異なっています。
こちらはクエリパラメータも含めて一致する必要があります。

#### invalid_client: Invalid client_id or client_secret

`client_id`, `client_secret` の組が見つかりませんでした。
正しいペアを入力しているか確認してください。

#### unsupported_grant_type: grant_type must be authorization_code

IdP では `grant_type=authorization_code` (Authorization Code Flow) のみがサポートされています。
それ以外を使用したい場合、その理由を書いて Issue に投げてください。

#### invalid_grant: Invalid Code (Already Used)

Code の再利用はできません。
