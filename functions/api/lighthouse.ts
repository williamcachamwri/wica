interface Env {
  PAGESPEED_API_KEY?: string
}

interface AuditMetric {
  score: number | null
  displayValue?: string
  title: string
}

interface PageSpeedResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score: number | null }
      accessibility?: { score: number | null }
      'best-practices'?: { score: number | null }
      seo?: { score: number | null }
    }
    audits?: Record<string, { score: number | null; displayValue?: string; title?: string }>
    fetchTime?: string
  }
  error?: { message: string }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=3600',
}

const CATEGORIES = ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO']

const AUDIT_KEYS = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive',
]

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const apiKey = context.env.PAGESPEED_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'Set PAGESPEED_API_KEY secret to fetch Lighthouse scores.' },
      { status: 503, headers: corsHeaders }
    )
  }

  const url = new URL(context.request.url)
  const target = url.searchParams.get('url') || 'https://wica.info'
  const strategy = url.searchParams.get('strategy') || 'desktop'

  const cache = caches.default
  const cacheUrl = new URL(`${target}?strategy=${strategy}`)
  cacheUrl.protocol = 'https'
  cacheUrl.hostname = 'lighthouse-cache'
  const cacheKey = new Request(cacheUrl.toString())
  const cached = await cache.match(cacheKey)
  if (cached) {
    return new Response(cached.body, {
      headers: { ...Object.fromEntries(cached.headers), ...corsHeaders },
    })
  }

  try {
    const params = new URLSearchParams({ url: target, strategy, key: apiKey })
    CATEGORIES.forEach((cat) => params.append('category', cat))

    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`
    )

    if (!res.ok) {
      const text = await res.text()
      return Response.json(
        { error: `PageSpeed API returned ${res.status}: ${text}` },
        { status: 502, headers: corsHeaders }
      )
    }

    const json: PageSpeedResponse = await res.json()
    if (json.error) {
      return Response.json({ error: json.error.message }, { status: 502, headers: corsHeaders })
    }

    const cats = json.lighthouseResult?.categories
    const audits = json.lighthouseResult?.audits || {}

    const metrics: Record<string, AuditMetric> = {}
    AUDIT_KEYS.forEach((key) => {
      const a = audits[key]
      if (a) {
        metrics[key] = {
          score: a.score ?? null,
          displayValue: a.displayValue,
          title: a.title || key,
        }
      }
    })

    const data = {
      url: target,
      strategy,
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
    const response = new Response(body, {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

    context.waitUntil(cache.put(cacheKey, response.clone()))
    return response
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'unknown error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
