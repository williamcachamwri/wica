import { jsonOK, jsonError } from '../utils/security'

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const REPO_ID = 'R_kgDOS6MeVw'
const CATEGORY_ID = 'DIC_kwDOS6MeV84C_Jgv'

const ALLOWED_ORIGINS = ['https://wica.info', 'https://wica.pages.dev', 'http://localhost:5173', 'http://127.0.0.1:5173']
const REACTION_EMOJIS = ['👍', '❤️', '😄', '🚀', '👀']

interface Env { GITHUB_TOKEN: string; TURNSTILE_SECRET: string }

function ghHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'wica-guestbook/1.0',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function emptyReactions(): Record<string, number> {
  return Object.fromEntries(REACTION_EMOJIS.map((e) => [e, 0]))
}

function serializeBody(message: string, author: string, reactions: Record<string, number>): string {
  return `${message}\n\n<!--guestbook:author:${author}-->\n<!--guestbook:reactions:${JSON.stringify(reactions)}-->`
}

function parseBody(body: string): { message: string; author: string; reactions: Record<string, number> } {
  const authorMatch = body.match(/<!--guestbook:author:([^>]+)-->/)
  const reactionsMatch = body.match(/<!--guestbook:reactions:(\{[^}]+\})-->/)
  const message = body
    .replace(/<!--guestbook:author:[^>]+-->/, '')
    .replace(/<!--guestbook:reactions:[^>]+-->/, '')
    .trim()

  let reactions = emptyReactions()
  if (reactionsMatch) {
    try { Object.assign(reactions, JSON.parse(reactionsMatch[1])) } catch {}
  }
  return {
    message,
    author: authorMatch ? authorMatch[1].trim() : 'anonymous',
    reactions,
  }
}

function formatEntry(node: { id: string; title: string; body: string; author: { login: string } | null; createdAt: string; url: string }) {
  const parsed = parseBody(node.body)
  return { id: node.id, message: parsed.message, author: parsed.author, date: node.createdAt, url: node.url, reactions: parsed.reactions }
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

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  // POST: create entry or react
  if (request.method === 'POST') {
    const origin = request.headers.get('Origin')
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return jsonError('Forbidden', 403, request)
    }

    if (!env.GITHUB_TOKEN) {
      return jsonError('GitHub token not configured', 503, request)
    }

    try {
      const payload = (await request.json()) as {
        message?: string; author?: string; turnstileToken?: string
        discussionId?: string; emoji?: string
      }

      // React to existing entry
      if (payload.discussionId && payload.emoji) {
        if (!REACTION_EMOJIS.includes(payload.emoji)) {
          return jsonError('Invalid reaction', 400, request)
        }

        const fetchData = await ghFetch(`query($nodeId: ID!) {
          node(id: $nodeId) { ... on Discussion { id title body author { login } createdAt url } }
        }`, env.GITHUB_TOKEN, { nodeId: payload.discussionId }) as any
        const node = fetchData?.node
        if (!node) return jsonError('Entry not found', 404, request)

        const parsed = parseBody(node.body)
        parsed.reactions[payload.emoji] = (parsed.reactions[payload.emoji] || 0) + 1

        const updateData = await ghFetch(`mutation($discussionId: ID!, $body: String!) {
          updateDiscussion(input: {discussionId: $discussionId, body: $body}) {
            discussion { id title body author { login } createdAt url }
          }
        }`, env.GITHUB_TOKEN, {
          discussionId: node.id,
          body: serializeBody(parsed.message, parsed.author, parsed.reactions),
        }) as any
        const updated = updateData?.updateDiscussion?.discussion
        if (!updated) return jsonError('Failed to update reaction', 500, request)

        return jsonOK(formatEntry(updated), request)
      }

      // Create new entry
      const message = payload.message
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return jsonError('Message is required', 400, request)
      }
      if (message.length > 500) {
        return jsonError('Message too long (max 500 chars)', 400, request)
      }

      if (!env.TURNSTILE_SECRET) {
        return jsonError('Turnstile not configured', 503, request)
      }
      if (!payload.turnstileToken) {
        return jsonError('Captcha required', 400, request)
      }

      const verifyRes = await fetch(TURNSTILE_VERIFY, {
        method: 'POST',
        body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: payload.turnstileToken }),
      })
      const verifyData = (await verifyRes.json()) as { success: boolean }
      if (!verifyData.success) {
        return jsonError('Captcha verification failed', 403, request)
      }

      const text = message.trim().slice(0, 500)
      const author = (payload.author || 'anonymous').toString().trim().slice(0, 32).replace(/[<>"'&]/g, '') || 'anonymous'
      const body = serializeBody(text, author, emptyReactions())

      const createData = await ghFetch(`mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
        createDiscussion(input: {repositoryId: $repoId, categoryId: $categoryId, title: $title, body: $body}) {
          discussion { id title body author { login } createdAt url }
        }
      }`, env.GITHUB_TOKEN, {
        repoId: REPO_ID,
        categoryId: CATEGORY_ID,
        title: text,
        body,
      }) as any
      const discussion = createData?.createDiscussion?.discussion
      if (!discussion) return jsonError('Failed to create entry', 500, request)

      return new Response(JSON.stringify(formatEntry(discussion)), {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' },
      })
    } catch (err) {
      return jsonError('Failed to process request', 500, request)
    }
  }

  // GET: list entries
  try {
    const data = await ghFetch(`query($categoryId: ID!) {
      repository(owner: "williamcachamwri", name: "wica") {
        discussions(first: 50, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: $categoryId) {
          nodes { id title body author { login } createdAt url }
        }
      }
    }`, env.GITHUB_TOKEN, { categoryId: CATEGORY_ID }) as any
    const nodes = data?.repository?.discussions?.nodes || []
    const entries = nodes.filter((n: any) => !n.title.startsWith('[blog-post:')).map(formatEntry)

    return jsonOK(entries, request)
  } catch (err) {
    return jsonError('Failed to fetch entries', 500, request)
  }
}
