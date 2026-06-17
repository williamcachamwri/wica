import { getCookieToken } from '../../../utils/auth'
import { jsonOK, jsonError } from '../../../utils/security'

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const REPO_ID = 'R_kgDOS6MeVw'
const CATEGORY_ID = 'DIC_kwDOS6MeV84C_Jgv'

const ALLOWED_ORIGINS = ['https://wica.info', 'https://wica.pages.dev', 'http://localhost:5173', 'http://127.0.0.1:5173']

interface Env { GITHUB_TOKEN: string }

function ghHeaders(token: string): Record<string, string> {
  return { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'wica-blog/1.0', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

function getDiscussionTitle(slug: string, title: string): string {
  return `[blog-post:${slug}] ${title}`
}

function parseReplyMarker(body: string): { cleanBody: string; parentId?: string } {
  const match = body.match(/^<!--reply:([^>]+)-->/)
  if (match) {
    return { cleanBody: body.replace(/^<!--reply:[^>]+-->/, ''), parentId: match[1] }
  }
  return { cleanBody: body }
}

function formatComment(node: { id: string; author?: { login: string; avatarUrl?: string }; body: string; createdAt: string; url: string }, parentId?: string) {
  const { cleanBody, parentId: markerParent } = parseReplyMarker(node.body)
  const effectiveParent = parentId || markerParent
  return { id: node.id, author: node.author?.login || 'anonymous', avatar: node.author?.avatarUrl, body: cleanBody, date: node.createdAt, url: node.url, ...(effectiveParent ? { parentId: effectiveParent } : {}) }
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

function csrfCheck(request: Request): Response | null {
  const origin = request.headers.get('Origin')
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return jsonError('Forbidden', 403, request)
  return null
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const token = getCookieToken(request)

  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug')
    const title = url.searchParams.get('title')
    if (!slug || !title || slug.length > 200 || title.length > 200) return jsonError('Invalid slug or title', 400, request)

    try {
      const data = await ghFetch(`query($categoryId: ID!) {
        repository(owner: "williamcachamwri", name: "wica") {
          discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: $categoryId) {
            nodes { id title body url createdAt comments(first: 50) { nodes { id author { login avatarUrl } body createdAt url replies(first: 10) { nodes { id author { login avatarUrl } body createdAt url } } } } reactions(first: 100) { nodes { content } } }
          }
        }
      }`, env.GITHUB_TOKEN, { categoryId: CATEGORY_ID }) as any
      const discussions = data?.repository?.discussions?.nodes || []
      const discussion = discussions.find((d: any) => d.title === getDiscussionTitle(slug, title))
      const comments = discussion?.comments?.nodes?.flatMap((c: any) => {
        const top = formatComment(c)
        const replies = (c.replies?.nodes || []).map((r: any) => formatComment(r, c.id))
        return [top, ...replies]
      }) || []
      const likes = (discussion?.reactions?.nodes || []).filter((r: any) => r.content === 'HEART').length
      return jsonOK({ comments, discussionId: discussion?.id, likes }, request)
    } catch (err) { console.error('[comment GET]', err); return jsonError('Failed to fetch comments', 500, request) }
  }

  if (request.method === 'POST') {
    const csrf = csrfCheck(request)
    if (csrf) return csrf
    if (!token) return jsonError('Not authenticated', 401, request)

    try {
      const { slug, title, body, replyTo } = (await request.json()) as { slug: string; title: string; body: string; replyTo?: string }
      if (!slug || !title || !body || !body.trim()) return jsonError('Slug, title and body are required', 400, request)
      if (slug.length > 200 || title.length > 200 || body.length > 5000) return jsonError('Input too long', 400, request)

      const discussionTitle = getDiscussionTitle(slug, title)

      const searchData = await ghFetch(`query($categoryId: ID!) {
        repository(owner: "williamcachamwri", name: "wica") {
          discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: $categoryId) {
            nodes { id title body url createdAt }
          }
        }
      }`, env.GITHUB_TOKEN, { categoryId: CATEGORY_ID }) as any
      const discussions = searchData?.repository?.discussions?.nodes || []
      let discussionId = discussions.find((d: any) => d.title === discussionTitle)?.id

      if (!discussionId) {
        const createData = await ghFetch(`mutation($repoId: ID!, $categoryId: ID!, $dTitle: String!, $dBody: String!) {
          createDiscussion(input: {repositoryId: $repoId, categoryId: $categoryId, title: $dTitle, body: $dBody}) {
            discussion { id title body url createdAt }
          }
        }`, env.GITHUB_TOKEN, { repoId: REPO_ID, categoryId: CATEGORY_ID, dTitle: discussionTitle, dBody: `Comments and likes for "${title}"\n\n<!--blog:likes:0-->` }) as any
        discussionId = createData?.createDiscussion?.discussion?.id
        if (!discussionId) throw new Error('Failed to create discussion')
      }

      const bodyWithMarker = replyTo ? `<!--reply:${replyTo}-->${body.trim()}` : body.trim()

      const commentData = await ghFetch(`mutation($discussionId: ID!, $body: String!) {
        addDiscussionComment(input: {discussionId: $discussionId, body: $body}) {
          comment { id author { login avatarUrl } body createdAt url }
        }
      }`, token, { discussionId, body: bodyWithMarker }) as any
      const comment = commentData?.addDiscussionComment?.comment
      if (!comment) throw new Error('Failed to create comment')

      return new Response(JSON.stringify(formatComment(comment, replyTo)), {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' },
      })
    } catch (err) {
      console.error('[comment POST]', err)
      const msg = err instanceof Error ? err.message : 'Failed to post comment'
      return jsonError(msg, 500, request)
    }
  }

  return jsonError('Method not allowed', 405, request)
}