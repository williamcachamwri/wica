interface Env {
  PAGESPEED_API_KEY?: string
}

interface PageSpeedResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score: number | null }
      accessibility?: { score: number | null }
      'best-practices'?: { score: number | null }
      seo?: { score: number | null }
    }
    fetchTime?: string
  }
  error?: {
    message: string
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=3600',
}

const CATEGORIES = ['PERFORMANCE', 'ACCESSIBILITY', 'BEST_PRACTICES', 'SEO']

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
  const strategy = url.searchParams.get('strategy') || 'mobile'

  try {
    const params = new URLSearchParams({
      url: target,
      strategy,
      key: apiKey,
    })
    CATEGORIES.forEach((cat) => params.append('category', cat))

    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`
    )

    if (!res.ok) {
      const text = await res.text()
      return Response.json(
        { error: `PageSpeed API error ${res.status}`, detail: text },
        { status: res.status, headers: corsHeaders }
      )
    }

    const json = (await res.json()) as PageSpeedResponse
    const cats = json.lighthouseResult?.categories

    const scores = {
      performance: cats?.performance?.score ?? null,
      accessibility: cats?.accessibility?.score ?? null,
      bestPractices: cats?.['best-practices']?.score ?? null,
      seo: cats?.seo?.score ?? null,
    }

    return Response.json(
      {
        url: target,
        strategy,
        fetchTime: json.lighthouseResult?.fetchTime,
        scores,
      },
      { headers: corsHeaders }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
