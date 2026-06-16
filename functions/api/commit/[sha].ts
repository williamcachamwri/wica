const SECURE = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'public, max-age=60',
}

const githubHeaders = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:151.0) Gecko/20100101 Firefox/151.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://github.com/williamcachamwri/wica/commits/main/',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Upgrade-Insecure-Requests': '1',
  'Connection': 'keep-alive',
}

function stripHtml(html: string): string {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/div>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

function toGitHubApiFormat(payload: any) {
  const commit = payload.payload?.commit
  const headerInfo = payload.payload?.headerInfo
  const diffEntries = payload.payload?.diffEntryData ?? []

  if (!commit) throw new Error('commit data not found')

  const title = stripHtml(commit.shortMessageMarkdown ?? '')
  const body = stripHtml(commit.bodyMessageHtml ?? '')
  const message = body ? `${title}\n\n${body}` : title
  const author = commit.authors?.[0]?.displayName || commit.committer?.displayName || ''
  const date = commit.committedDate || commit.authoredDate

  const files = diffEntries.map((entry: any) => {
    const patchLines = entry.diffLines?.map((l: any) => l.text)
    let additions = entry.linesAdded ?? 0
    let deletions = entry.linesDeleted ?? 0

    if (patchLines && (additions === 0 || deletions === 0)) {
      const calc = patchLines.reduce((acc: any, line: string) => {
        if (line.startsWith('+') && !line.startsWith('+++')) acc.add += 1
        else if (line.startsWith('-') && !line.startsWith('---')) acc.del += 1
        return acc
      }, { add: 0, del: 0 })
      if (calc.add > 0) additions = calc.add
      if (calc.del > 0) deletions = calc.del
    }

    return {
      filename: entry.path,
      status: entry.status.toLowerCase(),
      additions, deletions,
      changes: additions + deletions,
      patch: patchLines?.join('\n'),
      isBinary: entry.isBinary || false,
      oldOid: entry.oldOid || null,
      newOid: entry.newOid || null,
    }
  })

  return {
    sha: commit.oid,
    commit: { message, author: { name: author, date }, committer: { name: author, date } },
    files,
    stats: { additions: headerInfo?.additions ?? files.reduce((s: number, f: any) => s + f.additions, 0), deletions: headerInfo?.deletions ?? files.reduce((s: number, f: any) => s + f.deletions, 0), total: files.length },
  }
}

export const onRequest: PagesFunction = async (context) => {
  const sha = context.params.sha as string

  try {
    const res = await fetch(`https://github.com/williamcachamwri/wica/commit/${sha}`, { headers: githubHeaders })
    if (!res.ok) return Response.json({ error: 'Failed to fetch commit' }, { status: res.status, headers: SECURE })

    const html = await res.text()
    const match = html.match(/<script type="application\/json" data-target="react-app\.embeddedData">([\s\S]*?)<\/script>/)
    if (!match) return Response.json({ error: 'Commit data not found' }, { status: 500, headers: SECURE })

    const payload = JSON.parse(match[1])
    const commit = payload.payload?.commit
    const sha1 = commit?.sha1
    const sha2 = commit?.sha2 || sha
    const diffEntries = payload.payload?.diffEntryData ?? []

    await Promise.all(diffEntries.map(async (entry: any, i: number) => {
      if ((entry.diffLines?.length ?? 0) > 0 || !sha1) return
      const diffRes = await fetch(`https://github.com/williamcachamwri/wica/diffs/${i}/diff-lines?sha1=${sha1}&sha2=${sha2}`, { headers: { ...githubHeaders, Accept: 'application/json' } })
      if (!diffRes.ok) return
      const diffJson = await diffRes.json() as { diffLines?: Array<{ type: string; text: string }> }
      if (diffJson.diffLines?.length) entry.diffLines = diffJson.diffLines
    }))

    return Response.json(toGitHubApiFormat(payload), { headers: SECURE })
  } catch {
    return Response.json({ error: 'Failed to process commit' }, { status: 500, headers: SECURE })
  }
}
