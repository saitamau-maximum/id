import { zValidator } from '@hono/zod-validator'
import { derivePublicKey, importKey } from '@saitamau-maximum/auth/internal'
import { token, tokenScope } from 'db/schema'
import { Hono } from 'hono'
import { HonoEnv } from 'load-context'
import { validateAuthToken } from 'utils/auth-token.server'
import { binaryToBase64 } from 'utils/convert-bin-base64'
import cookieSessionStorage from 'utils/session.server'
import { z } from 'zod'

const app = new Hono<HonoEnv>()

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/29

app.post(
  '/',
  zValidator(
    'form',
    z.object({
      client_id: z.string(),
      redirect_uri: z.string().url().optional(),
      state: z.string().optional(),
      scope: z
        .string()
        .regex(
          /^[\x21|\x23-\x5B|\x5D-\x7E]+(?:\x20+[\x21|\x23-\x5B|\x5D-\x7E]+)*$/,
        )
        .optional(),
      time: z.string().regex(/^\d+$/),
      auth_token: z.string().base64(),
      authorized: z.literal('1').or(z.literal('0')),
    }),
    async (res, c) => {
      // TODO: いい感じのエラー画面を作るかも
      if (!res.success) return c.text('Bad Request: invalid parameters', 400)
    },
  ),
  async c => {
    const {
      auth_token,
      authorized,
      client_id,
      redirect_uri,
      time: _time,
      scope,
      state,
    } = c.req.valid('form')
    const time = parseInt(_time, 10)
    const nowUnixMs = Date.now()

    c.header('Cache-Control', 'no-store')
    c.header('Pragma', 'no-cache')

    const publicKey = await derivePublicKey(
      await importKey(c.env.PRIVKEY, 'privateKey'),
    )
    const isValidToken = await validateAuthToken({
      clientId: client_id,
      redirectUri: redirect_uri,
      scope,
      state,
      time,
      key: publicKey,
      hash: auth_token,
    })
    // auth_token が妥当 = client_id,redirect_uri,time,scope,state がリクエスト時と一致
    if (!isValidToken) {
      return c.text('Bad Request: invalid auth_token', 400)
    }

    // ログインしてるか
    const { getSession } = cookieSessionStorage(c.env)
    const session = await getSession(c.req.raw.headers.get('Cookie'))
    const userId = session.get('user_id')
    if (!userId) {
      // ログインしてない場合は何かがおかしい
      return c.text('Bad Request: not logged in', 400)
    }
    const userInfo = await c.var.idpClient.findUserById(userId)
    if (!userInfo) {
      // 存在しないユーザー
      // これも何かがおかしい
      return c.text('Bad Request: invalid user', 400)
    }

    // タイムリミットは 5 min
    if (time + 5 * 60 * 1000 < nowUnixMs) {
      // TODO: 5 min 以内に承認してくださいみたいなメッセージ追加すべき？
      return c.text('Bad Request: authorization request expired', 400)
    }

    let redirectTo: URL
    if (redirect_uri) {
      redirectTo = new URL(redirect_uri)
    } else {
      // DB から読み込み
      // `/authorize` 側で client_id に対応する callback_url は必ず存在して 1 つだけであることを保証している
      const clientCallback =
        await c.var.dbClient.query.clientCallback.findFirst({
          where: (clientCallback, { eq }) =>
            eq(clientCallback.client_id, client_id),
        })
      if (!clientCallback) {
        return c.text('Internal Server Error: client callback not found', 500)
      }
      redirectTo = new URL(clientCallback.callback_url)
    }

    redirectTo.searchParams.append('state', state || '')
    if (authorized === '0') {
      redirectTo.searchParams.append('error', 'access_denied')
      redirectTo.searchParams.append(
        'error_description',
        'The user denied the request',
      )
      // redirectTo.searchParams.append('error_uri', '') // そのうち書きたいね
      return c.redirect(redirectTo.href, 302)
    }

    // scope 取得
    const requestedScopes = new Set(scope ? scope.split(' ') : [])
    const scopes = (
      await c.var.dbClient.query.clientScope.findMany({
        where: (clientScope, { eq }) => eq(clientScope.client_id, client_id),
        with: {
          scope: true,
        },
      })
    )
      .map(clientScope => clientScope.scope)
      .filter(data => {
        // scope リクエストしてない場合は requestedScopes = [] なので、全部 true として付与
        if (requestedScopes.size === 0) return true
        // そうでない場合はリクエストされた scope だけを付与
        return requestedScopes.has(data.name)
      })

    // code (240bit = 8bit * 30) を生成
    const code = binaryToBase64(crypto.getRandomValues(new Uint8Array(30)))

    // access token (312bit = 8bit * 39) を生成
    const accessToken = binaryToBase64(
      crypto.getRandomValues(new Uint8Array(39)),
    )

    // DB に格納
    // transaction が使えないが、 batch だと autoincrement な token id を取得できないので、 Cloudflare の力を信じてふつうに insert する
    const tokenInsertRes = await c.var.dbClient
      .insert(token)
      .values({
        client_id,
        user_id: userId,
        code,
        code_expires_at: new Date(nowUnixMs + 1 * 60 * 1000), // 1 min
        code_used: false,
        redirect_uri,
        access_token: accessToken,
        access_token_expires_at: new Date(nowUnixMs + 1 * 60 * 60 * 1000), // 1 hour
      })
      .returning()
    if (tokenInsertRes.length === 0) {
      redirectTo.searchParams.append('error', 'server_error')
      redirectTo.searchParams.append(
        'error_description',
        'Failed to insert token',
      )
      // redirectTo.searchParams.append('error_uri', '') // そのうち書きたいね
      return c.redirect(redirectTo.href, 302)
    }
    const tokenScopeInsertRes = await c.var.dbClient.insert(tokenScope).values(
      scopes.map(scope => ({
        token_id: tokenInsertRes[0].id,
        scope_id: scope.id,
      })),
    )
    if (!tokenScopeInsertRes.success) {
      redirectTo.searchParams.append('error', 'server_error')
      redirectTo.searchParams.append(
        'error_description',
        'Failed to insert token scope',
      )
      // redirectTo.searchParams.append('error_uri', '') // そのうち書きたいね
      return c.redirect(redirectTo.href, 302)
    }

    redirectTo.searchParams.append('code', code)

    return c.redirect(redirectTo.href, 302)
  },
)

// POST 以外は許容しない
app.all('/', async c => {
  return c.text('method not allowed', 405)
})

export default app
