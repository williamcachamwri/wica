interface Env {
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
}

const COOKIE_NAME = 'gh_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function setTokenCookie(token: string, isLocalhost: boolean): string {
  const secure = !isLocalhost ? '; Secure' : ''
  const newCookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/api/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`
  const clearOld = `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
  return `${newCookie}\n${clearOld}`
}

function deleteTokenCookie(isLocalhost: boolean): string {
  const secure = !isLocalhost ? '; Secure' : ''
  return `${COOKIE_NAME}=; Path=/api/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

  // Logout
  if (url.pathname.endsWith('/logout')) {
    const redirect = url.searchParams.get('redirect') || '/'
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirect,
        'Set-Cookie': deleteTokenCookie(isLocalhost),
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response(JSON.stringify({ error: 'GitHub OAuth not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  // Callback
  const code = url.searchParams.get('code')
  if (code) {
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
      return new Response(JSON.stringify({ error: tokenData.error_description || 'GitHub OAuth failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const redirect = url.searchParams.get('state') || '/'
    const cookieStr = setTokenCookie(tokenData.access_token, isLocalhost)
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirect,
        'Set-Cookie': cookieStr.split('\n'),
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // Start OAuth flow
  const redirect = url.searchParams.get('redirect') || '/'
  const authUrl = new URL('https://github.com/login/oauth/authorize')
  authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/github`)
  authUrl.searchParams.set('scope', 'read:user public_repo')
  authUrl.searchParams.set('state', redirect)

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      'Access-Control-Allow-Origin': '*',
    },
  })
}
