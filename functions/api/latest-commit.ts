interface Env { GITHUB_TOKEN?: string }

const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'public, max-age=60',
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const token = context.env.GITHUB_TOKEN
  if (!token) {
    return Response.json({ error: 'GitHub token not configured' }, { status: 503, headers: HEADERS })
  }

  try {
    const res = await fetch('https://api.github.com/repos/williamcachamwri/wica/commits/main', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'wica-site' },
    })
    if (!res.ok) return Response.json({ error: 'GitHub API error' }, { status: res.status, headers: HEADERS })

    const json = (await res.json()) as { sha: string; commit?: { committer?: { date?: string }; author?: { date?: string } } }
    return Response.json({ sha: json.sha.slice(0, 7), date: json.commit?.committer?.date || json.commit?.author?.date || '' }, { headers: HEADERS })
  } catch {
    return Response.json({ error: 'Failed to fetch commit' }, { status: 500, headers: HEADERS })
  }
}
