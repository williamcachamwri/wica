const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const REPO_ID = 'R_kgDOS6MeVw'
const CATEGORY_ID = 'DIC_kwDOS6MeV84C_Jgv'

function headers(token) {
  const h = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'wica-guestbook/1.0',
    'Content-Type': 'application/json',
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

const LIST_QUERY = `query {
  repository(owner: "williamcachamwri", name: "wica") {
    discussions(first: 50, orderBy: {field: CREATED_AT, direction: DESC}, categoryId: "${CATEGORY_ID}") {
      nodes {
        id
        title
        author { login }
        createdAt
        url
      }
    }
  }
}`

function formatDiscussion(node) {
  return {
    id: node.id,
    message: node.title,
    author: node.author?.login || 'anonymous',
    date: node.createdAt,
    url: node.url,
  }
}

export async function onRequest(context) {
  const { request, env } = context

  if (request.method === 'POST') {
    if (!env.GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    try {
      const { message, turnstileToken } = await request.json()
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

      if (!turnstileToken) {
        return new Response(JSON.stringify({ error: 'Captcha required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      const verifyRes = await fetch(TURNSTILE_VERIFY, {
        method: 'POST',
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET,
          response: turnstileToken,
        }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        return new Response(JSON.stringify({ error: 'Captcha verification failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }

      const text = message.trim()
      const mutation = `mutation {
        createDiscussion(input: {
          repositoryId: "${REPO_ID}",
          categoryId: "${CATEGORY_ID}",
          title: ${JSON.stringify(text)},
          body: ${JSON.stringify(text)}
        }) {
          discussion {
            id
            title
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

      const json = await res.json()

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
      return new Response(JSON.stringify({ error: err.message }), {
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

    const json = await res.json()

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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}
