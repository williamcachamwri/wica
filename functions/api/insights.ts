interface Env { CLOUDFLARE_API_TOKEN?: string; CLOUDFLARE_ZONE_ID?: string }

const SECURE = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' }
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Cache-Control': 'public, max-age=300' }

function generateMockData(days = 35) {
  const data: Array<{ date: string; sessions: number; visitors: number }> = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today); date.setDate(date.getDate() - i)
    const t = i / days; const base = Math.sin(t * Math.PI * 3) * 80 + 120
    data.push({ date: date.toISOString().split('T')[0], visitors: Math.max(20, Math.round(base + Math.random() * 60 - 30)), sessions: Math.max(30, Math.round(Math.max(20, Math.round(base + Math.random() * 60 - 30)) * (1.1 + Math.random() * 0.4))) })
  }
  return data
}

async function fetchZoneAnalytics(token: string, zoneId: string) {
  const today = new Date(); const since = new Date(today); since.setDate(since.getDate() - 35)
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query($zoneTag: string!, $since: Time!, $until: Time!) {
        viewer { zones(filter: { zoneTag: $zoneTag }) { httpRequests1dGroups(limit: 40, filter: { date_geq: $since, date_leq: $until }) { dimensions { date } sum { pageViews requests } uniq { uniques } } } }
      }`,
      variables: { zoneTag: zoneId, since: since.toISOString().split('T')[0], until: today.toISOString().split('T')[0] },
    }),
  })
  if (!res.ok) throw new Error('Cloudflare API error')
  const json = (await res.json()) as any
  if (json.errors) throw new Error('Cloudflare API error')
  return (json.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? []).map((g: any) => ({ date: g.dimensions.date, sessions: g.sum.pageViews ?? 0, visitors: g.uniq?.uniques ?? 0 })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') return new Response(null, { headers: { ...CORS, ...SECURE } })

  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = context.env
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    return Response.json({ data: generateMockData(), mock: true, message: 'Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID secrets to fetch real analytics.' }, { headers: { ...CORS, ...SECURE } })
  }

  try {
    const data = await fetchZoneAnalytics(CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID)
    return Response.json({ data, mock: false }, { headers: { ...CORS, ...SECURE } })
  } catch {
    return Response.json({ data: generateMockData(), mock: true }, { headers: { ...CORS, ...SECURE } })
  }
}
