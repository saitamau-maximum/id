import { Hono } from 'hono'

import { HonoEnv } from '../../load-context'

import oauthAccesstokenRoute from './accessToken'
import oauthAuthorizeRoute from './authorize'
import oauthCallbackRoute from './callback'
import oauthVerifytokenRoute from './verifyToken'

const app = new Hono<HonoEnv>()

app.route('/authorize', oauthAuthorizeRoute)
app.route('/callback', oauthCallbackRoute)
app.route('/access-token', oauthAccesstokenRoute)
app.route('/verify-token', oauthVerifytokenRoute)

export default app
