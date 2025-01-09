import { zValidator } from '@hono/zod-validator'
import { token, tokenScope } from 'db/schema'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { HonoEnv } from 'load-context'
import { z } from 'zod'

const app = new Hono<HonoEnv>()

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/29

app.post(
  '/',
  async (c, next) => {
    // もし Authorization ヘッダーがある場合は 401 を返す
    const authHeader = c.req.header('Authorization')
    if (authHeader) {
      return c.json(
        {
          error: 'invalid_request',
          error_description: 'Authorization header is not allowed',
          // "error_uri": "" // そのうち書く
        },
        401,
      )
    }
    return next()
  },
  zValidator(
    'form',
    z.object({
      grant_type: z.string(),
      code: z.string(),
      redirect_uri: z.string().url().optional(),
      client_id: z.string(),
      client_secret: z.string(),
    }),
    async (res, c) => {
      // TODO: いい感じのエラー画面を作るかも
      if (!res.success)
        return c.json(
          {
            error: 'invalid_request',
            error_description: 'Invalid Parameters',
            // "error_uri": "" // そのうち書く
          },
          400,
        )
    },
  ),
  async c => {
    const { client_id, client_secret, code, redirect_uri, grant_type } =
      c.req.valid('form')

    const nowUnixMs = Date.now()
    const nowDate = new Date(nowUnixMs)

    const tokenInfo = await c.var.dbClient.query.token.findFirst({
      where: (token, { eq, and, gt }) =>
        and(eq(token.code, code), gt(token.code_expires_at, nowDate)),
      with: {
        client: {
          with: {
            secrets: {
              where: (secret, { eq }) => eq(secret.secret, client_secret),
            },
          },
        },
        scopes: {
          with: {
            scope: true,
          },
        },
      },
    })

    c.header('Cache-Control', 'no-store')
    c.header('Pragma', 'no-cache')

    // Token が見つからない場合
    if (!tokenInfo) {
      return c.json(
        {
          error: 'invalid_grant',
          error_description: 'Invalid Code (Not Found, Expired, etc)',
          // "error_uri": "" // そのうち書く
        },
        401,
      )
    }

    // redirect_uri 一致チェック
    if (
      (redirect_uri && tokenInfo.redirect_uri !== redirect_uri) ||
      (!redirect_uri && tokenInfo.redirect_uri)
    ) {
      return c.json(
        {
          error: 'invalid_request',
          error_description: 'Redirect URI mismatch',
          // "error_uri": "" // そのうち書く
        },
        400,
      )
    }

    // client id, secret のペアが存在するかチェック
    if (
      tokenInfo.client.id !== client_id ||
      tokenInfo.client.secrets.length === 0
    ) {
      return c.json(
        {
          error: 'invalid_client',
          error_description: 'Invalid client_id or client_secret',
          // "error_uri": "" // そのうち書く
        },
        401,
      )
    }

    // grant_type チェック
    if (grant_type !== 'authorization_code') {
      return c.json(
        {
          error: 'unsupported_grant_type',
          error_description: 'grant_type must be authorization_code',
          // "error_uri": "" // そのうち書く
        },
        400,
      )
    }

    // もしすでに token が使われていた場合
    if (tokenInfo.code_used) {
      // そのレコードを削除
      // 失敗していても response は変わらないので無視
      await c.var.dbClient.batch([
        // これ順番逆にすると外部キー制約で落ちるよ (戒め)
        c.var.dbClient
          .delete(tokenScope)
          .where(eq(tokenScope.token_id, tokenInfo.id)),
        c.var.dbClient.delete(token).where(eq(token.id, tokenInfo.id)),
      ])
      return c.json(
        {
          error: 'invalid_grant',
          error_description: 'Invalid Code (Already Used)',
          // "error_uri": "" // そのうち書く
        },
        401,
      )
    }

    // token が使われたことを記録
    await c.var.dbClient
      .update(token)
      .set({ code_used: true })
      .where(eq(token.id, tokenInfo.id))

    // token の残り時間を計算
    const remMs = tokenInfo.code_expires_at.getTime() - nowUnixMs

    return c.json(
      {
        access_token: tokenInfo.access_token,
        token_type: 'bearer',
        expires_in: Math.floor(remMs / 1000),
        scope: tokenInfo.scopes.map(s => s.scope.name).join(' '),
      },
      200,
    )
  },
)

// POST 以外は許容しない
app.all('/', async c => {
  return c.text('method not allowed', 405)
})

export default app
