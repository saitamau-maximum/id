# 開発時に便利な Routes

Server 側のパスです。
つまり、 `http://localhost:8787` とかをパスの前につけてください。

これらのパスは開発時にのみ利用可能です。
Preview, Production 環境では利用できません。

## `/dev/cron`

Cron Trigger をテストできます。

## `/dev/oauth/:clientId/:clientSecret`

> [!NOTE]
> `:clientId`, `:clientSecret` は適宜書き換えてください。
>
> `:clientSecret` にスラッシュが含まれているとパスが正しく解釈されずに 404 になるので、スラッシュが出なくなるまで根気強く再生成してください。
> $(63/64)^{52} \approx 0.44091$ なので、だいたい 44% の確率でスラッシュが含まれない secret が得られます。
> 2, 3 回くらい繰り返せば得られるでしょう。

指定した ClientId, ClientSecret で OAuth Flow に入ります。
つまり、 `http://localhost:8787/oauth/authorize?foo=bar` にリダイレクトされます。

設定から `/dev/oauth/:clientId/:clientSecret/callback` を Callback URL として指定しておいてください。
Token Response が得られます。

> [!TIP]
> `response_type`, `client_id`, `redirect_uri` 以外のクエリパラメータを指定すると、それを Authorization Endpoint に横流しできます。
