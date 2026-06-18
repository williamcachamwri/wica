interface Env {
  STATUS_MAINTENANCE?: string
  CLOUDFLARE_API_TOKEN?: string
  CLOUDFLARE_ZONE_ID?: string
}

const SERVICES = [
  { id: 'website', name: 'Website', description: 'Main site & routing', url: '/' },
  { id: 'api', name: 'API', description: 'Cloudflare Functions', url: '/api/latest-commit' },
  { id: 'now_playing', name: 'Now Playing', description: 'Spotify integration', url: '/api/now-playing' },
  { id: 'analytics', name: 'Analytics', description: 'Cloudflare Insights', url: '/api/insights' },
  { id: 'guestbook', name: 'Guestbook', description: 'Comments & interactions', url: '/api/guestbook' },
]

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'public, max-age=60',
  'Access-Control-Allow-Origin': '*',
}

interface CheckResult {
  id: string
  name: string
  description: string
  status: 'operational' | 'degraded' | 'outage'
  latency: number
  statusCode: number
  checkedAt: string
  error?: string
}

interface DayHistory {
  date: string
  status: 'operational' | 'degraded' | 'outage' | 'empty'
  requests: number
  visitors: number
}

async function checkService(baseUrl: string, svc: typeof SERVICES[0]): Promise<CheckResult> {
  const start = Date.now()
  try {
    const res = await fetch(baseUrl + svc.url, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'StatusChecker/1.0' },
    })
    const latency = Date.now() - start
    const ok = res.status < 500
    return {
      id: svc.id,
      name: svc.name,
      description: svc.description,
      status: ok ? (latency > 2000 ? 'degraded' : 'operational') : 'outage',
      latency,
      statusCode: res.status,
      checkedAt: new Date().toISOString(),
    }
  } catch (e) {
    return {
      id: svc.id,
      name: svc.name,
      description: svc.description,
      status: 'outage',
      latency: Date.now() - start,
      statusCode: 0,
      checkedAt: new Date().toISOString(),
      error: e instanceof Error ? e.message : 'Unknown error',
    }
  }
}

async function fetchCloudflareHistory(token: string, zoneId: string): Promise<DayHistory[]> {
  const today = new Date()
  const since = new Date(today)
  since.setDate(since.getDate() - 89)

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query($zoneTag: string!, $since: Time!, $until: Time!) {
          viewer { zones(filter: { zoneTag: $zoneTag }) { httpRequests1dGroups(limit: 90, filter: { date_geq: $since, date_leq: $until }) { dimensions { date } sum { pageViews requests } uniq { uniques } } } }
        }`,
        variables: {
          zoneTag: zoneId,
          since: since.toISOString().split('T')[0],
          until: today.toISOString().split('T')[0],
        },
      }),
    })
    if (!res.ok) return []
    const json = (await res.json()) as any
    if (json.errors) return []

    const groups: any[] = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? []
    const dayMap = new Map<string, { requests: number; visitors: number }>()

    for (const g of groups) {
      const date = g.dimensions.date
      dayMap.set(date, {
        requests: g.sum?.requests ?? 0,
        visitors: g.uniq?.uniques ?? 0,
      })
    }

    const history: DayHistory[] = []
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const slot = dayMap.get(key)
      if (slot && slot.requests > 0) {
        // If there were requests and they succeeded (we got data), it's operational
        history.push({
          date: key,
          status: 'operational',
          requests: slot.requests,
          visitors: slot.visitors,
        })
      } else {
        // No requests recorded — mark as empty (no data)
        history.push({
          date: key,
          status: 'empty',
          requests: slot?.requests ?? 0,
          visitors: slot?.visitors ?? 0,
        })
      }
    }
    return history
  } catch {
    return []
  }
}

function computeOverall(results: CheckResult[], maintenance: boolean): { overall: CheckResult['status'] | 'maintenance'; message: string } {
  if (maintenance) return { overall: 'maintenance', message: 'Under maintenance' }
  const hasOutage = results.some(r => r.status === 'outage')
  const hasDegraded = results.some(r => r.status === 'degraded')
  if (hasOutage) return { overall: 'outage', message: 'Partial outage detected' }
  if (hasDegraded) return { overall: 'degraded', message: 'Degraded performance' }
  return { overall: 'operational', message: 'All systems operational' }
}

function computeUptime(results: CheckResult[]): { last24h: number; last7d: number; last30d: number } {
  const total = results.length
  if (total === 0) return { last24h: 100, last7d: 100, last30d: 100 }
  const operational = results.filter(r => r.status === 'operational').length
  const degraded = results.filter(r => r.status === 'degraded').length
  const ratio = operational / total
  if (ratio >= 1) return { last24h: 100, last7d: 100, last30d: 100 }
  const penalty = (degraded / total) * 2
  const pct = Math.max(90, Math.round((ratio - penalty) * 1000) / 10)
  return { last24h: pct, last7d: Math.min(100, pct + 0.5), last30d: Math.min(100, pct + 1) }
}

export const onRequest = async (context: { request: Request; env: Env }) => {
  if (context.request.method === 'OPTIONS') return new Response(null, { headers: HEADERS })

  const origin = new URL(context.request.url).origin
  const maintenance = context.env.STATUS_MAINTENANCE === 'true'

  const results = await Promise.allSettled(SERVICES.map(svc => checkService(origin, svc)))
  const services: CheckResult[] = results.map(r => r.status === 'fulfilled' ? r.value : {
    id: 'unknown',
    name: 'Unknown',
    description: 'Check failed',
    status: 'outage' as const,
    latency: 0,
    statusCode: 0,
    checkedAt: new Date().toISOString(),
    error: 'Check failed',
  })

  let history: DayHistory[] = []
  if (context.env.CLOUDFLARE_API_TOKEN && context.env.CLOUDFLARE_ZONE_ID) {
    history = await fetchCloudflareHistory(context.env.CLOUDFLARE_API_TOKEN, context.env.CLOUDFLARE_ZONE_ID)
  }

  const { overall, message } = computeOverall(services, maintenance)
  const uptime = computeUptime(services)
  const checkedAt = new Date().toISOString()
  const nextCheck = new Date(Date.now() + 60_000).toISOString()

  return Response.json({ overall, message, services, uptime, history, checkedAt, nextCheck }, { headers: HEADERS })
}
