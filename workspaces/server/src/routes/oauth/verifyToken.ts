import { Hono } from 'hono'

import { READ_SCOPES } from '../../constants/scope'
import { HonoEnv } from '../../load-context'
import { IUserInfo } from '../../repository/idp'

import { authMiddleware } from './_middleware'

const app = new Hono<HonoEnv>()

// 仕様はここ参照: https://github.com/saitamau-maximum/auth/issues/43

interface ValidResponseType {
  valid: true
  client: {
    id: string
    name: string
    description: string | null
    logo_url: string | null
    owner_id: string
  }
  user_id: string
  expires_at: number
  scopes: string[]
  user_info?: IUserInfo
}

interface InvalidResponseType {
  valid: false
  client: null
  user_id: null
  expires_at: null
  scopes: null
}

const INVALID_REQUEST_RESPONSE: InvalidResponseType = {
  valid: false,
  client: null,
  user_id: null,
  expires_at: null,
  scopes: null,
}

app.get('/', authMiddleware, async c => {
  const tokenInfo = c.var.tokenInfo

  c.header('Cache-Control', 'no-store')
  c.header('Pragma', 'no-cache')

  // Token が見つからない場合
  if (!tokenInfo) {
    return c.json<InvalidResponseType>(INVALID_REQUEST_RESPONSE, 404)
  }

  const res: ValidResponseType = {
    valid: true,
    client: tokenInfo.client,
    user_id: tokenInfo.user_id,
    expires_at: tokenInfo.access_token_expires_at.getTime(),
    scopes: tokenInfo.scopes.map(s => s.scope.name),
  }

  if (res.scopes.includes(READ_SCOPES.BASIC_INFO)) {
    const user = await c.var.idpClient.findUserById(res.user_id)
    if (user) res.user_info = user
  }

  return c.json<ValidResponseType>(res)
})

// POST 以外は許容しない
app.all('/', async c => {
  return c.text('method not allowed', 405)
})

export default app
