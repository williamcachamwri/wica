import { jsonOK, jsonError } from '../utils/security'

interface Env { PAGESPEED_API_KEY?: string }

const AUDIT_KEYS = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index', 'interactive']
const CATEGORIES = ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO']

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
  }

  const apiKey = context.env.PAGESPEED_API_KEY
  if (!apiKey) {
    return jsonError('PageSpeed API key not configured', 503)
  }

  const url = new URL(context.request.url)
  const target = url.searchParams.get('url') || 'https://wica.info'
  const strategy = url.searchParams.get('strategy') || 'desktop'

  const cache = caches.default
  const cacheUrl = new URL(`${target}?strategy=${strategy}`)
  cacheUrl.protocol = 'https'
  cacheUrl.hostname = 'lighthouse-cache'
  const cached = await cache.match(new Request(cacheUrl.toString()))
  if (cached) return new Response(cached.body, { headers: { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': 'public, max-age=3600', ...Object.fromEntries(cached.headers) } })

  try {
    const params = new URLSearchParams({ url: target, strategy, key: apiKey })
    CATEGORIES.forEach((cat) => params.append('category', cat))

    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`)
    if (!res.ok) return jsonError('PageSpeed API error', 502)

    const json = (await res.json()) as any
    if (json.error) return jsonError('PageSpeed API error', 502)

    const cats = json.lighthouseResult?.categories
    const audits = json.lighthouseResult?.audits || {}

    const metrics: Record<string, unknown> = {}
    AUDIT_KEYS.forEach((key) => {
      const a = audits[key]
      if (a) metrics[key] = { score: a.score ?? null, displayValue: a.displayValue, title: a.title || key }
    })

    const data = {
      url: target, strategy,
      fetchTime: json.lighthouseResult?.fetchTime,
      scores: {
        performance: cats?.performance?.score ?? null,
        accessibility: cats?.accessibility?.score ?? null,
        bestPractices: cats?.['best-practices']?.score ?? null,
        seo: cats?.seo?.score ?? null,
      },
      metrics,
    }

    const body = JSON.stringify(data)
    const response = jsonOK(data, context.request, { 'Cache-Control': 'public, max-age=3600' })
    context.waitUntil(cache.put(new Request(cacheUrl.toString()), response.clone()))
    return response
  } catch {
    return jsonError('Failed to fetch Lighthouse results', 500)
  }
}
