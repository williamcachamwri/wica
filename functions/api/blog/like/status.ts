const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const GITHUB_API = 'https://api.github.com'
const CATEGORY_ID = 'DIC_kwDOS6MeV84C_Jgv'

interface Env {
  GITHUB_TOKEN: string
}

interface GitHubResponse {
  data?: {
    repository?: {
      discussions?: {
        nodes?: Array<{
          id: string
          title: string
          reactions?: {
            nodes?: Array<{
              id: string
              content: string
              user?: { login: string }
            }>
          }
        }>
      }
    }
  }
  errors?: Array<{ message: string }>
}

function headers(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'wica-blog/1.0',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function getCookieToken(request: Request): string | null {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  const match = cookie.match(/(?:^|;\s*)gh_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function getViewerLogin(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${GITHUB_API}/user`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'wica-blog/1.0',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as { login: string }
    return data.login
  } catch {
    return null
  }
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const token = getCookieToken(request)

  if (!token) {
    return new Response(JSON.stringify({ liked: false }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  const slug = url.searchParams.get('slug')
  const title = url.searchParams.get('title')
  if (!slug || !title) {
    return new Response(JSON.stringify({ error: 'Slug and title are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  try {
    const viewerLogin = await getViewerLogin(token)
    if (!viewerLogin) {
      return new Response(JSON.stringify({ liked: false }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const discussionTitle = `[blog-post:${slug}] ${title}`
    const query = `query {
      repository(owner: "williamcachamwri", name: "wica") {
        discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: "${CATEGORY_ID}") {
          nodes {
            id
            title
            reactions(first: 100) {
              nodes {
                id
                content
                user { login }
              }
            }
          }
        }
      }
    }`

    const res = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: headers(env.GITHUB_TOKEN),
      body: JSON.stringify({ query }),
    })
    const json = (await res.json()) as GitHubResponse
    if (json.errors) throw new Error(json.errors[0]?.message || 'GitHub API error')

    const discussions = json.data?.repository?.discussions?.nodes || []
    const discussion = discussions.find((d) => d.title === discussionTitle)
    const hasLiked = (discussion?.reactions?.nodes || []).some(
      (r) => r.content === 'HEART' && r.user?.login === viewerLogin
    )

    return new Response(JSON.stringify({ liked: hasLiked }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}
