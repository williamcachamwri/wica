import { getCookieToken } from '../../../utils/auth'
import { jsonOK, jsonError } from '../../../utils/security'

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const GITHUB_API = 'https://api.github.com'
const CATEGORY_ID = 'DIC_kwDOS6MeV84C_Jgv'

interface Env { GITHUB_TOKEN: string }

function ghHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'wica-blog/1.0',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function getViewerLogin(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${GITHUB_API}/user`, {
      headers: { Accept: 'application/vnd.github.v3+json', Authorization: `Bearer ${token}`, 'User-Agent': 'wica-blog/1.0' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { login: string }
    return data.login
  } catch { return null }
}

async function ghFetch(query: string, token: string, variables?: Record<string, unknown>) {
  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: ghHeaders(token),
    body: JSON.stringify(variables ? { query, variables } : { query }),
  })
  const json = (await res.json()) as { data?: unknown; errors?: Array<{ message: string }> }
  if (json.errors) return null
  return json.data
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const token = getCookieToken(request)

  if (!token) {
    return jsonOK({ liked: false }, request)
  }

  const slug = url.searchParams.get('slug')
  const title = url.searchParams.get('title')
  if (!slug || !title || slug.length > 200 || title.length > 200) {
    return jsonError('Invalid slug or title', 400, request)
  }

  try {
    const viewerLogin = await getViewerLogin(token)
    if (!viewerLogin) {
      return jsonOK({ liked: false }, request)
    }

    const discussionTitle = `[blog-post:${slug}] ${title}`
    const data = await ghFetch(`query($categoryId: ID!) {
      repository(owner: "williamcachamwri", name: "wica") {
        discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: $categoryId) {
          nodes { id title reactions(first: 100) { nodes { id content user { login } } } }
        }
      }
    }`, env.GITHUB_TOKEN, { categoryId: CATEGORY_ID }) as any

    const discussions = data?.repository?.discussions?.nodes || []
    const discussion = discussions.find((d: any) => d.title === discussionTitle)
    const hasLiked = (discussion?.reactions?.nodes || []).some(
      (r: any) => r.content === 'HEART' && r.user?.login === viewerLogin
    )

    return jsonOK({ liked: hasLiked }, request)
  } catch {
    return jsonError('Failed to check like status', 500, request)
  }
}
