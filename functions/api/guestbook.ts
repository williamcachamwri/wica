const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const REPO_ID = 'R_kgDOS6MeVw'
const CATEGORY_ID = 'DIC_kwDOS6MeV84C_Jgv'

const REACTION_EMOJIS = ['👍', '❤️', '😄', '🚀', '👀']

interface Env {
  GITHUB_TOKEN: string
  TURNSTILE_SECRET: string
}

interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
}

interface DiscussionNode {
  id: string
  title: string
  body: string
  author: { login: string } | null
  createdAt: string
  url: string
}

interface GitHubResponse {
  data?: {
    repository?: {
      discussions?: {
        nodes?: DiscussionNode[]
      }
    }
    createDiscussion?: {
      discussion?: DiscussionNode
    }
    updateDiscussion?: {
      discussion?: DiscussionNode
    }
    node?: DiscussionNode
  }
  errors?: Array<{ message: string }>
}

interface Entry {
  id: string
  message: string
  author: string
  date: string
  url: string
  reactions: Record<string, number>
}

function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'wica-guestbook/1.0',
    'Content-Type': 'application/json',
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

function emptyReactions(): Record<string, number> {
  return Object.fromEntries(REACTION_EMOJIS.map((e) => [e, 0]))
}

function serializeBody(message: string, author: string, reactions: Record<string, number>): string {
  return `${message}\n\n<!--guestbook:author:${author}-->\n<!--guestbook:reactions:${JSON.stringify(reactions)}-->`
}

function parseBody(body: string): { message: string; author: string; reactions: Record<string, number> } {
  const authorMatch = body.match(/<!--guestbook:author:([^>]+)-->/)
  const reactionsMatch = body.match(/<!--guestbook:reactions:({[^}]+})-->/)
  const message = body
    .replace(/<!--guestbook:author:[^>]+-->/, '')
    .replace(/<!--guestbook:reactions:[^>]+-->/, '')
    .trim()

  let reactions = emptyReactions()
  if (reactionsMatch) {
    try {
      const parsed = JSON.parse(reactionsMatch[1])
      reactions = { ...emptyReactions(), ...parsed }
    } catch {
      // keep defaults
    }
  }

  return {
    message,
    author: authorMatch ? authorMatch[1].trim() : 'anonymous',
    reactions,
  }
}

function formatDiscussion(node: DiscussionNode): Entry {
  const parsed = parseBody(node.body)
  return {
    id: node.id,
    message: parsed.message,
    author: parsed.author,
    date: node.createdAt,
    url: node.url,
    reactions: parsed.reactions,
  }
}

const LIST_QUERY = `query {
  repository(owner: "williamcachamwri", name: "wica") {
    discussions(first: 50, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: "${CATEGORY_ID}") {
      nodes {
        id
        title
        body
        author { login }
        createdAt
        url
      }
    }
  }
}`

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  if (request.method === 'POST') {
    if (!env.GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    try {
      const payload = (await request.json()) as {
        message?: string
        author?: string
        turnstileToken?: string
        discussionId?: string
        emoji?: string
      }

      // React to an existing entry
      if (payload.discussionId && payload.emoji) {
        if (!REACTION_EMOJIS.includes(payload.emoji)) {
          return new Response(JSON.stringify({ error: 'Invalid reaction' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          })
        }

        const fetchQuery = `query {
          node(id: "${payload.discussionId}") {
            ... on Discussion {
              id
              title
              body
              author { login }
              createdAt
              url
            }
          }
        }`

        const fetchRes = await fetch(GITHUB_GRAPHQL, {
          method: 'POST',
          headers: headers(env.GITHUB_TOKEN),
          body: JSON.stringify({ query: fetchQuery }),
        })
        const fetchJson = (await fetchRes.json()) as GitHubResponse
        if (fetchJson.errors) {
          throw new Error(fetchJson.errors[0]?.message || 'GitHub API error')
        }
        const node = fetchJson.data?.node
        if (!node) throw new Error('Entry not found')

        const parsed = parseBody(node.body)
        parsed.reactions[payload.emoji] = (parsed.reactions[payload.emoji] || 0) + 1

        const updateMutation = `mutation {
          updateDiscussion(input: {
            discussionId: "${node.id}",
            body: ${JSON.stringify(serializeBody(parsed.message, parsed.author, parsed.reactions))}
          }) {
            discussion {
              id
              title
              body
              author { login }
              createdAt
              url
            }
          }
        }`

        const updateRes = await fetch(GITHUB_GRAPHQL, {
          method: 'POST',
          headers: headers(env.GITHUB_TOKEN),
          body: JSON.stringify({ query: updateMutation }),
        })
        const updateJson = (await updateRes.json()) as GitHubResponse
        if (updateJson.errors) {
          throw new Error(updateJson.errors[0]?.message || 'GitHub API error')
        }
        const updated = updateJson.data?.updateDiscussion?.discussion
        if (!updated) throw new Error('Failed to update reaction')

        return new Response(JSON.stringify(formatDiscussion(updated)), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      // Create a new entry
      const message = payload.message
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Message is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      if (!env.TURNSTILE_SECRET) {
        return new Response(JSON.stringify({ error: 'Turnstile not configured' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      if (!payload.turnstileToken) {
        return new Response(JSON.stringify({ error: 'Captcha required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      const verifyRes = await fetch(TURNSTILE_VERIFY, {
        method: 'POST',
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET,
          response: payload.turnstileToken,
        }),
      })
      const verifyData = (await verifyRes.json()) as TurnstileResponse
      if (!verifyData.success) {
        return new Response(JSON.stringify({ error: 'Captcha verification failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      const text = message.trim()
      const author = (payload.author || 'anonymous').toString().trim().slice(0, 32) || 'anonymous'
      const body = serializeBody(text, author, emptyReactions())

      const mutation = `mutation {
        createDiscussion(input: {
          repositoryId: "${REPO_ID}",
          categoryId: "${CATEGORY_ID}",
          title: ${JSON.stringify(text)},
          body: ${JSON.stringify(body)}
        }) {
          discussion {
            id
            title
            body
            author { login }
            createdAt
            url
          }
        }
      }`

      const res = await fetch(GITHUB_GRAPHQL, {
        method: 'POST',
        headers: headers(env.GITHUB_TOKEN),
        body: JSON.stringify({ query: mutation }),
      })

      const json = (await res.json()) as GitHubResponse

      if (json.errors) {
        throw new Error(json.errors[0]?.message || 'GitHub API error')
      }

      const discussion = json.data?.createDiscussion?.discussion
      if (!discussion) throw new Error('Failed to create discussion')

      return new Response(JSON.stringify(formatDiscussion(discussion)), {
        status: 201,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }
  }

  try {
    const res = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: headers(env.GITHUB_TOKEN),
      body: JSON.stringify({ query: LIST_QUERY }),
    })

    const json = (await res.json()) as GitHubResponse

    if (json.errors) {
      throw new Error(json.errors[0]?.message || 'GitHub API error')
    }

    const nodes = json.data?.repository?.discussions?.nodes || []
    const data = nodes.map(formatDiscussion)

    return new Response(JSON.stringify(data), {
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
