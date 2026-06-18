interface Env { CLOUDFLARE_API_TOKEN?: string; CLOUDFLARE_ZONE_ID?: string }

const SECURE = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' }
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Cache-Control': 'public, max-age=300' }
const DAYS = 35

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3)
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

function generateMockData() {
  const today = new Date()
  const timeSeries = []
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = new Date(today); date.setDate(date.getDate() - i)
    const t = i / DAYS; const base = Math.sin(t * Math.PI * 3) * 80 + 120
    const visitors = Math.max(20, Math.round(base + Math.random() * 60 - 30))
    const pageViews = Math.max(30, Math.round(visitors * (1.3 + Math.random() * 0.6)))
    const requests = Math.round(pageViews * (1.1 + Math.random() * 0.3))
    const bytes = Math.round(requests * (40000 + Math.random() * 120000))
    const threats = Math.round(visitors * (0.01 + Math.random() * 0.04))
    timeSeries.push({ date: date.toISOString().split('T')[0], pageViews, requests, visitors, bytes, threats })
  }

  const totals = timeSeries.reduce((a, d) => ({ pageViews: a.pageViews + d.pageViews, requests: a.requests + d.requests, visitors: a.visitors + d.visitors, bytes: a.bytes + d.bytes, threats: a.threats + d.threats }), { pageViews: 0, requests: 0, visitors: 0, bytes: 0, threats: 0 })

  const countries = [
    { name: 'United States', requests: Math.round(totals.requests * 0.38), visitors: Math.round(totals.visitors * 0.35), bytes: Math.round(totals.bytes * 0.40) },
    { name: 'Vietnam', requests: Math.round(totals.requests * 0.22), visitors: Math.round(totals.visitors * 0.25), bytes: Math.round(totals.bytes * 0.18) },
    { name: 'Germany', requests: Math.round(totals.requests * 0.09), visitors: Math.round(totals.visitors * 0.08), bytes: Math.round(totals.bytes * 0.10) },
    { name: 'Japan', requests: Math.round(totals.requests * 0.07), visitors: Math.round(totals.visitors * 0.06), bytes: Math.round(totals.bytes * 0.08) },
    { name: 'United Kingdom', requests: Math.round(totals.requests * 0.06), visitors: Math.round(totals.visitors * 0.05), bytes: Math.round(totals.bytes * 0.06) },
    { name: 'France', requests: Math.round(totals.requests * 0.04), visitors: Math.round(totals.visitors * 0.04), bytes: Math.round(totals.bytes * 0.04) },
    { name: 'Canada', requests: Math.round(totals.requests * 0.03), visitors: Math.round(totals.visitors * 0.03), bytes: Math.round(totals.bytes * 0.03) },
    { name: 'Singapore', requests: Math.round(totals.requests * 0.02), visitors: Math.round(totals.visitors * 0.02), bytes: Math.round(totals.bytes * 0.02) },
  ]

  const statusCodes = [
    { code: '200', requests: Math.round(totals.requests * 0.84), label: 'OK' },
    { code: '301', requests: Math.round(totals.requests * 0.04), label: 'Moved' },
    { code: '304', requests: Math.round(totals.requests * 0.03), label: 'Not Modified' },
    { code: '404', requests: Math.round(totals.requests * 0.02), label: 'Not Found' },
    { code: '403', requests: Math.round(totals.requests * 0.01), label: 'Forbidden' },
    { code: '500', requests: Math.round(totals.requests * 0.005), label: 'Server Error' },
  ]

  const httpMethods = [
    { method: 'GET', requests: Math.round(totals.requests * 0.73) },
    { method: 'POST', requests: Math.round(totals.requests * 0.14) },
    { method: 'HEAD', requests: Math.round(totals.requests * 0.05) },
    { method: 'PUT', requests: Math.round(totals.requests * 0.03) },
    { method: 'DELETE', requests: Math.round(totals.requests * 0.02) },
    { method: 'PATCH', requests: Math.round(totals.requests * 0.01) },
  ]

  return { timeSeries, totals, countries, statusCodes, httpMethods }
}

function countryName(code: string): string {
  if (!code || code === '') return 'Unknown'
  const names: Record<string, string> = {
    US: 'United States', VN: 'Vietnam', DE: 'Germany', JP: 'Japan', GB: 'United Kingdom',
    FR: 'France', CA: 'Canada', SG: 'Singapore', AU: 'Australia', IN: 'India',
    KR: 'South Korea', BR: 'Brazil', NL: 'Netherlands', SE: 'Sweden', NO: 'Norway',
    FI: 'Finland', DK: 'Denmark', CH: 'Switzerland', AT: 'Austria', BE: 'Belgium',
    IT: 'Italy', ES: 'Spain', PT: 'Portugal', IE: 'Ireland', NZ: 'New Zealand',
    CN: 'China', TW: 'Taiwan', HK: 'Hong Kong', RU: 'Russia', UA: 'Ukraine',
    PL: 'Poland', CZ: 'Czechia', SK: 'Slovakia', HU: 'Hungary', RO: 'Romania',
    BG: 'Bulgaria', GR: 'Greece', TR: 'Turkey', IL: 'Israel', AE: 'UAE',
    SA: 'Saudi Arabia', ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya',
    AR: 'Argentina', CL: 'Chile', CO: 'Colombia', MX: 'Mexico',
  }
  return names[code] || code
}

function statusLabel(code: string): string {
  const labels: Record<string, string> = {
    '200': 'OK', '201': 'Created', '204': 'No Content',
    '301': 'Moved', '302': 'Found', '304': 'Not Modified',
    '400': 'Bad Request', '401': 'Unauthorized', '403': 'Forbidden',
    '404': 'Not Found', '405': 'Method Not Allowed', '408': 'Timeout',
    '429': 'Too Many Requests', '500': 'Server Error', '502': 'Bad Gateway',
    '503': 'Unavailable', '504': 'Gateway Timeout',
  }
  return labels[code] || ''
}

async function fetchDetailed(token: string, zoneId: string) {
  const today = new Date()
  const since = new Date(today); since.setDate(since.getDate() - DAYS)
  const sinceStr = since.toISOString().split('T')[0]
  const untilStr = today.toISOString().split('T')[0]

  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `query($zoneTag: string!, $since: Time!, $until: Time!) {
        viewer {
          zones(filter: { zoneTag: $zoneTag }) {
            daily: httpRequests1dGroups(limit: 40, filter: { date_geq: $since, date_leq: $until }) {
              dimensions { date }
              sum { pageViews requests bytes threats }
              uniq { uniques }
            }
            countries: httpRequests1dGroups(limit: 15, filter: { date_geq: $since, date_leq: $until }) {
              dimensions { clientCountryName }
              sum { requests bytes }
              uniq { uniques }
            }
            statuses: httpRequests1dGroups(limit: 10, filter: { date_geq: $since, date_leq: $until }) {
              dimensions { edgeResponseStatus }
              sum { requests }
            }
            methods: httpRequests1dGroups(limit: 10, filter: { date_geq: $since, date_leq: $until }) {
              dimensions { clientRequestHTTPMethodName }
              sum { requests }
            }
          }
        }
      }`,
      variables: { zoneTag: zoneId, since: sinceStr, until: untilStr },
    }),
  })

  if (!res.ok) throw new Error(`Cloudflare API error: ${res.status}`)
  const json = (await res.json()) as any
  if (json.errors) throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`)

  const zone = json.data?.viewer?.zones?.[0]

  const timeSeries = (zone?.daily ?? [])
    .map((g: any) => ({
      date: g.dimensions.date,
      pageViews: g.sum.pageViews ?? 0,
      requests: g.sum.requests ?? 0,
      visitors: g.uniq?.uniques ?? 0,
      bytes: g.sum.bytes ?? 0,
      threats: g.sum.threats ?? 0,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totals = timeSeries.reduce((a: any, d: any) => ({
    pageViews: a.pageViews + d.pageViews,
    requests: a.requests + d.requests,
    visitors: a.visitors + d.visitors,
    bytes: a.bytes + d.bytes,
    threats: a.threats + d.threats,
  }), { pageViews: 0, requests: 0, visitors: 0, bytes: 0, threats: 0 })

  const countries = (zone?.countries ?? [])
    .map((g: any) => ({
      name: countryName(g.dimensions.clientCountryName),
      requests: g.sum.requests ?? 0,
      visitors: g.uniq?.uniques ?? 0,
      bytes: g.sum.bytes ?? 0,
    }))
    .sort((a: any, b: any) => b.requests - a.requests)

  const statusCodes = (zone?.statuses ?? [])
    .map((g: any) => ({
      code: String(g.dimensions.edgeResponseStatus ?? 'unknown'),
      label: statusLabel(String(g.dimensions.edgeResponseStatus ?? 'unknown')),
      requests: g.sum.requests ?? 0,
    }))
    .sort((a: any, b: any) => b.requests - a.requests)

  const httpMethods = (zone?.methods ?? [])
    .map((g: any) => ({
      method: g.dimensions.clientRequestHTTPMethodName ?? 'UNKNOWN',
      requests: g.sum.requests ?? 0,
    }))
    .sort((a: any, b: any) => b.requests - a.requests)

  return { timeSeries, totals, countries, statusCodes, httpMethods }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') return new Response(null, { headers: { ...CORS, ...SECURE } })

  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = context.env
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    return Response.json({ ...generateMockData(), mock: true, message: 'Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID secrets to fetch real analytics.' }, { headers: { ...CORS, ...SECURE } })
  }

  try {
    const data = await fetchDetailed(CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID)
    return Response.json({ ...data, mock: false }, { headers: { ...CORS, ...SECURE } })
  } catch (err) {
    console.error('Detailed insights error:', err)
    return Response.json({ ...generateMockData(), mock: true }, { headers: { ...CORS, ...SECURE } })
  }
}
