import { setTokenCookie, deleteTokenCookie, nonceCookie, redirectCookie, clearNonceCookie, getNonceFromCookie, getRedirectFromCookie } from '../../utils/auth'
import { safeRedirect, jsonError } from '../../utils/security'

interface Env {
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  const secure = !isLocalhost

  // Logout
  if (url.pathname.endsWith('/logout')) {
    const redirect = safeRedirect(url.searchParams.get('redirect'), '/')
    const headers = new Headers({ Location: redirect })
    headers.append('Set-Cookie', deleteTokenCookie(secure))
    return new Response(null, { status: 302, headers })
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return jsonError('GitHub OAuth not configured', 503)
  }

  // Callback — verify CSRF nonce
  const code = url.searchParams.get('code')
  if (code) {
    const state = url.searchParams.get('state')
    const nonce = getNonceFromCookie(request)

    if (!state || !nonce || state !== nonce) {
      return jsonError('CSRF validation failed', 403)
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string; error_description?: string }

    if (!tokenData.access_token) {
      return jsonError(tokenData.error_description || 'GitHub OAuth failed', 400)
    }

    const redirect = safeRedirect(getRedirectFromCookie(request), '/')
    const headers = new Headers({ Location: redirect })
    for (const cookie of setTokenCookie(tokenData.access_token, secure)) {
      headers.append('Set-Cookie', cookie)
    }
    headers.append('Set-Cookie', clearNonceCookie(secure))
    return new Response(null, { status: 302, headers })
  }

  // Start OAuth flow
  const redirect = safeRedirect(url.searchParams.get('redirect'), '/')
  const nonce = crypto.randomUUID()

  const authUrl = new URL('https://github.com/login/oauth/authorize')
  authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/github`)
  authUrl.searchParams.set('scope', 'read:user public_repo')
  authUrl.searchParams.set('state', nonce)

  const headers = new Headers({ Location: authUrl.toString() })
  headers.append('Set-Cookie', nonceCookie(nonce, secure))
  headers.append('Set-Cookie', redirectCookie(redirect, secure))
  return new Response(null, { status: 302, headers })
}
