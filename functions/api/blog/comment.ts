const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const REPO_ID = 'R_kgDOS6MeVw'
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
          body: string
          url: string
          createdAt: string
          comments?: {
            nodes?: Array<{
              id: string
              author?: { login: string; avatarUrl?: string }
              body: string
              createdAt: string
              url: string
            }>
          }
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
    addDiscussionComment?: {
      comment?: {
        id: string
        author?: { login: string; avatarUrl?: string }
        body: string
        createdAt: string
        url: string
      }
    }
  }
  errors?: Array<{ message: string }>
}

interface Comment {
  id: string
  author: string
  avatar?: string
  body: string
  date: string
  url: string
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

function formatComment(node: { id: string; author?: { login: string; avatarUrl?: string }; body: string; createdAt: string; url: string }): Comment {
  return {
    id: node.id,
    author: node.author?.login || 'anonymous',
    avatar: node.author?.avatarUrl,
    body: node.body,
    date: node.createdAt,
    url: node.url,
  }
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context
  const url = new URL(request.url)
  const token = getCookieToken(request)

  // GET: list comments
  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug')
    const title = url.searchParams.get('title')
    if (!slug || !title) {
      return new Response(JSON.stringify({ error: 'Slug and title are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    try {
      const discussionTitle = getDiscussionTitle(slug, title)
      const query = `query {
        repository(owner: "williamcachamwri", name: "wica") {
          discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: "${CATEGORY_ID}") {
            nodes {
              id
              title
              body
              url
              createdAt
              comments(first: 50) {
                nodes {
                  id
                  author { login avatarUrl }
                  body
                  createdAt
                  url
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
      const comments = discussion?.comments?.nodes?.map(formatComment) || []
      const likes = (discussion?.body.match(/<!--blog:likes:(\d+)-->/) || [null, '0'])[1]

      return new Response(JSON.stringify({ comments, discussionId: discussion?.id, likes: parseInt(likes, 10) }), {
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

  // POST: add comment
  if (request.method === 'POST') {
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    try {
      const { slug, title, body } = (await request.json()) as { slug: string; title: string; body: string }
      if (!slug || !title || !body || !body.trim()) {
        return new Response(JSON.stringify({ error: 'Slug, title and body are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      const discussionTitle = getDiscussionTitle(slug, title)

      // Find or create discussion
      const searchQuery = `query {
        repository(owner: "williamcachamwri", name: "wica") {
          discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: "${CATEGORY_ID}") {
            nodes {
              id
              title
              body
              url
              createdAt
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
      let discussionId = discussions.find((d) => d.title === discussionTitle)?.id

      if (!discussionId) {
        const createMutation = `mutation {
          createDiscussion(input: {
            repositoryId: "${REPO_ID}",
            categoryId: "${CATEGORY_ID}",
            title: ${JSON.stringify(discussionTitle)},
            body: ${JSON.stringify(`Comments and likes for "${title}"\n\n<!--blog:likes:0-->`)}
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
        discussionId = createJson.data?.createDiscussion?.discussion?.id
        if (!discussionId) throw new Error('Failed to create discussion')
      }

      const commentMutation = `mutation {
        addDiscussionComment(input: {
          discussionId: "${discussionId}",
          body: ${JSON.stringify(body.trim())}
        }) {
          comment {
            id
            author { login avatarUrl }
            body
            createdAt
            url
          }
        }
      }`

      const commentRes = await fetch(GITHUB_GRAPHQL, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({ query: commentMutation }),
      })
      const commentJson = (await commentRes.json()) as GitHubResponse
      if (commentJson.errors) throw new Error(commentJson.errors[0]?.message || 'GitHub API error')

      const comment = commentJson.data?.addDiscussionComment?.comment
      if (!comment) throw new Error('Failed to create comment')

      return new Response(JSON.stringify(formatComment(comment)), {
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

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}
