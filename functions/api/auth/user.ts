import { getCookieToken } from '../../utils/auth'
import { jsonOK, jsonError } from '../../utils/security'

const GITHUB_API = 'https://api.github.com'

export async function onRequest(context: { request: Request }): Promise<Response> {
  const { request } = context
  const token = getCookieToken(request)

  if (!token) {
    return jsonError('Not authenticated', 401, request)
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
      return jsonError('Invalid token', 401, request)
    }

    const data = (await res.json()) as { login: string; avatar_url: string }
    return jsonOK({ login: data.login, avatar: data.avatar_url }, request)
  } catch {
    return jsonError('Authentication error', 500, request)
  }
}
