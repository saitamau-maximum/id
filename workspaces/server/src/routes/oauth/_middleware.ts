import { MiddlewareHandler } from 'hono'
import { HonoEnv } from 'load-context'

const AUTHORIZATION_REGEX = /^Bearer (.+)$/

export const authMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const authorization = c.req.header('Authorization')
  const accessToken = authorization?.match(AUTHORIZATION_REGEX)?.[1]
  if (!accessToken) {
    return c.text('Unauthorized', 401)
  }

  const nowUnixMs = Date.now()
  const nowDate = new Date(nowUnixMs)

  const tokenInfo = await c.var.dbClient.query.token.findFirst({
    where: (token, { eq, and, gt }) =>
      and(
        eq(token.access_token, accessToken),
        gt(token.code_expires_at, nowDate),
      ),
    with: {
      client: true,
      scopes: {
        with: {
          scope: true,
        },
      },
    },
  })

  if (!tokenInfo) {
    return c.text('Unauthorized', 401)
  }

  c.set('tokenInfo', tokenInfo)

  await next()
}
