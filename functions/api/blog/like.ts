const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const REPO_ID = 'R_kgDOS6MeVw'
const CATEGORY_ID = 'DIC_kwDOS6MeV84C_Jgv'
const LIKE_EMOJI = '❤️'

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
          body: string
          url: string
          createdAt: string
          reactions?: { nodes?: Array<{ content: string; user?: { login: string } }> }
        }>
      }
    }
    createDiscussion?: {
      discussion?: {
        id: string
        title: string
        body: string
        url: string
        createdAt: string
      }
    }
    addReaction?: {
      reaction?: { id: string }
    }
    viewer?: { login: string }
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

function getDiscussionTitle(slug: string, title: string): string {
  return `[blog-post:${slug}] ${title}`
}

function getCookieToken(request: Request): string | null {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  const match = cookie.match(/(?:^|;\s*)gh_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  const token = getCookieToken(request)
  if (!token) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  try {
    const { slug, title } = (await request.json()) as { slug: string; title: string }
    if (!slug || !title) {
      return new Response(JSON.stringify({ error: 'Slug and title are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    // Find existing discussion for this post
    const searchQuery = `query {
      repository(owner: "williamcachamwri", name: "wica") {
        discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: "${CATEGORY_ID}") {
          nodes {
            id
            title
            body
            url
            createdAt
            reactions(first: 100) {
              nodes {
                content
                user { login }
              }
            }
          }
        }
      }
    }`

    const searchRes = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: headers(env.GITHUB_TOKEN),
      body: JSON.stringify({ query: searchQuery }),
    })
    const searchJson = (await searchRes.json()) as GitHubResponse
    if (searchJson.errors) throw new Error(searchJson.errors[0]?.message || 'GitHub API error')

    const discussions = searchJson.data?.repository?.discussions?.nodes || []
    const discussionTitle = getDiscussionTitle(slug, title)
    let discussion = discussions.find((d) => d.title === discussionTitle)

    // Create discussion if not exists
    if (!discussion) {
      const createMutation = `mutation {
        createDiscussion(input: {
          repositoryId: "${REPO_ID}",
          categoryId: "${CATEGORY_ID}",
          title: ${JSON.stringify(discussionTitle)},
          body: ${JSON.stringify(`Comments and likes for "${title}"`)}
        }) {
          discussion {
            id
            title
            body
            url
            createdAt
          }
        }
      }`

      const createRes = await fetch(GITHUB_GRAPHQL, {
        method: 'POST',
        headers: headers(env.GITHUB_TOKEN),
        body: JSON.stringify({ query: createMutation }),
      })
      const createJson = (await createRes.json()) as GitHubResponse
      if (createJson.errors) throw new Error(createJson.errors[0]?.message || 'GitHub API error')
      const created = createJson.data?.createDiscussion?.discussion
      if (!created) throw new Error('Failed to create discussion')
      discussion = { ...created, reactions: { nodes: [] } }
    }

    // Add reaction using the user's token
    const reactionMutation = `mutation {
      addReaction(input: {
        subjectId: "${discussion.id}",
        content: HEART
      }) {
        reaction { id }
      }
    }`

    const reactionRes = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ query: reactionMutation }),
    })
    const reactionJson = (await reactionRes.json()) as GitHubResponse
    if (reactionJson.errors) {
      // Likely already reacted
      return new Response(JSON.stringify({ error: 'Already liked' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    // Refetch reactions to get accurate count
    const countQuery = `query {
      node(id: "${discussion.id}") {
        ... on Discussion {
          reactions(first: 100) {
            nodes { content }
          }
        }
      }
    }`

    const countRes = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: headers(env.GITHUB_TOKEN),
      body: JSON.stringify({ query: countQuery }),
    })
    const countJson = (await countRes.json()) as GitHubResponse
    const heartCount = (countJson.data?.node?.reactions?.nodes || []).filter((r) => r.content === 'HEART').length

    return new Response(JSON.stringify({ liked: true, count: heartCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}
