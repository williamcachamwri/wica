interface Env {
  CLOUDFLARE_API_TOKEN?: string
  CLOUDFLARE_ZONE_ID?: string
}

interface InsightsDataPoint {
  date: string
  sessions: number
  visitors: number
}

interface GraphQLResponse {
  data?: {
    viewer?: {
      zones?: Array<{
        httpRequests1dGroups?: Array<{
          dimensions: { date: string }
          sum: { pageViews: number; requests: number }
          uniq?: { uniques: number }
        }>
      }>
    }
  }
  errors?: Array<{ message: string }>
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=300',
}

function generateMockData(days = 35): InsightsDataPoint[] {
  const data: InsightsDataPoint[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const t = i / days
    const base = Math.sin(t * Math.PI * 3) * 80 + 120
    const visitors = Math.max(20, Math.round(base + Math.random() * 60 - 30))
    const sessions = Math.max(30, Math.round(visitors * (1.1 + Math.random() * 0.4)))
    data.push({ date: date.toISOString().split('T')[0], visitors, sessions })
  }
  return data
}

function formatDateISO(d: Date) {
  return d.toISOString().split('T')[0]
}

async function fetchZoneAnalytics(token: string, zoneId: string): Promise<InsightsDataPoint[]> {
  const today = new Date()
  const since = new Date(today)
  since.setDate(since.getDate() - 35)

  const query = `
    query GetZoneAnalytics($zoneTag: string!, $since: Time!, $until: Time!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(
            limit: 40,
            filter: { date_geq: $since, date_leq: $until }
          ) {
            dimensions {
              date
            }
            sum {
              pageViews
              requests
            }
            uniq {
              uniques
            }
          }
        }
      }
    }
  `

  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        zoneTag: zoneId,
        since: formatDateISO(since),
        until: formatDateISO(today),
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudflare API error ${res.status}: ${text}`)
  }

  const json = (await res.json()) as GraphQLResponse

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message)
  }

  const groups = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups ?? []

  return groups
    .map((g) => ({
      date: g.dimensions.date,
      sessions: g.sum.pageViews ?? 0,
      visitors: g.uniq?.uniques ?? Math.round((g.sum.pageViews ?? 0) * 0.6),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = context.env

  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
    return Response.json(
      {
        data: generateMockData(),
        mock: true,
        message: 'Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID secrets to fetch real analytics.',
      },
      { headers: corsHeaders }
    )
  }

  try {
    const data = await fetchZoneAnalytics(CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID)
    return Response.json({ data, mock: false }, { headers: corsHeaders })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json(
      {
        data: generateMockData(),
        mock: true,
        message,
      },
      { status: 200, headers: corsHeaders }
    )
  }
}
