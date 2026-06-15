interface Env {
  GITHUB_TOKEN?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=60',
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const token = context.env.GITHUB_TOKEN

  if (!token) {
    return Response.json(
      { error: 'GITHUB_TOKEN not configured' },
      { status: 500, headers: corsHeaders }
    )
  }

  try {
    const res = await fetch('https://api.github.com/repos/williamcachamwri/wica/commits/main', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'wica-site',
      },
    })

    if (!res.ok) {
      const text = await res.text()
      return Response.json(
        { error: `GitHub API error ${res.status}`, detail: text },
        { status: res.status, headers: corsHeaders }
      )
    }

    const json = await res.json()
    return Response.json(
      {
        sha: json.sha.slice(0, 7),
        date: json.commit?.committer?.date || json.commit?.author?.date || '',
      },
      { headers: corsHeaders }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
