import { getCookieToken } from '../../utils/auth'
import { jsonOK, jsonError } from '../../utils/security'

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const GITHUB_API = 'https://api.github.com'
const REPO_ID = 'R_kgDOS6MeVw'
const CATEGORY_ID = 'DIC_kwDOS6MeV84C_Jgv'

const ALLOWED_ORIGINS = ['https://wica.info', 'https://wica.pages.dev', 'http://localhost:5173', 'http://127.0.0.1:5173']

interface Env { GITHUB_TOKEN: string }

function ghHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'wica-blog/1.0',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function getDiscussionTitle(slug: string, title: string): string {
  return `[blog-post:${slug}] ${title}`
}

async function ghFetch(query: string, token: string, variables?: Record<string, unknown>) {
  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: ghHeaders(token),
    body: JSON.stringify(variables ? { query, variables } : { query }),
  })
  const json = (await res.json()) as { data?: unknown; errors?: Array<{ message: string }> }
  if (json.errors) throw new Error('GitHub API error')
  return json.data
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

  if (request.method !== 'POST') {
    return jsonError('Method not allowed', 405, request)
  }

  const origin = request.headers.get('Origin')
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return jsonError('Forbidden', 403, request)
  }

  const token = getCookieToken(request)
  if (!token) {
    return jsonError('Not authenticated', 401, request)
  }

  const viewerLogin = await getViewerLogin(token)
  if (!viewerLogin) {
    return jsonError('Failed to identify user', 401, request)
  }

  try {
    const { slug, title } = (await request.json()) as { slug: string; title: string }
    if (!slug || !title || slug.length > 200 || title.length > 200) {
      return jsonError('Invalid slug or title', 400, request)
    }

    // Find discussion
    const searchQuery = `query($categoryId: ID!) {
      repository(owner: "williamcachamwri", name: "wica") {
        discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: $categoryId) {
          nodes { id title body url createdAt reactions(first: 100) { nodes { id content user { login } } } }
        }
      }
    }`
    const searchData = await ghFetch(searchQuery, env.GITHUB_TOKEN, { categoryId: CATEGORY_ID }) as any
    const discussions = searchData?.repository?.discussions?.nodes || []
    const discussionTitle = getDiscussionTitle(slug, title)
    let discussion = discussions.find((d: any) => d.title === discussionTitle)

    // Create if not exists
    if (!discussion) {
      const createMutation = `mutation($repoId: ID!, $categoryId: ID!, $dTitle: String!, $dBody: String!) {
        createDiscussion(input: {repositoryId: $repoId, categoryId: $categoryId, title: $dTitle, body: $dBody}) {
          discussion { id title body url createdAt }
        }
      }`
      const createData = await ghFetch(createMutation, env.GITHUB_TOKEN, {
        repoId: REPO_ID,
        categoryId: CATEGORY_ID,
        dTitle: discussionTitle,
        dBody: `Comments and likes for "${title}"`,
      }) as any
      const created = createData?.createDiscussion?.discussion
      if (!created) throw new Error('Failed to create discussion')
      discussion = { ...created, reactions: { nodes: [] } }
    }

    const existingReaction = (discussion.reactions?.nodes || []).find(
      (r: any) => r.content === 'HEART' && r.user?.login === viewerLogin
    )

    let liked: boolean

    if (existingReaction) {
      await ghFetch(`mutation($subjectId: ID!) {
        removeReaction(input: {subjectId: $subjectId, content: HEART}) { reaction { id } }
      }`, token, { subjectId: discussion.id })
      liked = false
    } else {
      await ghFetch(`mutation($subjectId: ID!) {
        addReaction(input: {subjectId: $subjectId, content: HEART}) { reaction { id } }
      }`, token, { subjectId: discussion.id })
      liked = true
    }

    // Refetch likes count
    const countData = await ghFetch(`query($nodeId: ID!) {
      node(id: $nodeId) {
        ... on Discussion { reactions(first: 100) { nodes { content } } }
      }
    }`, env.GITHUB_TOKEN, { nodeId: discussion.id }) as any
    const heartCount = (countData?.node?.reactions?.nodes || []).filter((r: any) => r.content === 'HEART').length

    return jsonOK({ liked, count: heartCount }, request)
  } catch (err) {
    return jsonError('Failed to update like', 500, request)
  }
}
