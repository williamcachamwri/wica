const GITHUB_API = 'https://api.github.com'

interface Env {
  GITHUB_TOKEN: string
}

function getCookieToken(request: Request): string | null {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  const match = cookie.match(/(?:^|;\s*)gh_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request } = context
  const token = getCookieToken(request)

  if (!token) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  try {
    const res = await fetch(`${GITHUB_API}/user`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'wica-blog/1.0',
      },
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const data = (await res.json()) as { login: string; avatar_url: string }
    return new Response(JSON.stringify({ login: data.login, avatar: data.avatar_url }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}
