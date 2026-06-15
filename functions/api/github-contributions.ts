const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

interface Env {
  GITHUB_TOKEN: string
}

interface GitHubResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number
          weeks?: Array<{
            contributionDays?: Array<{
              date: string
              contributionCount: number
              weekday: number
            }>
          }>
        }
      }
    }
  }
  errors?: Array<{ message: string }>
}

interface Day {
  date: string
  count: number
  weekday: number
}

interface Week {
  days: Day[]
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context

  if (!env.GITHUB_TOKEN) {
    return new Response(JSON.stringify({ total: 0, weeks: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    const query = `query {
      user(login: "williamcachamwri") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                weekday
              }
            }
          }
        }
      }
    }`

    const res = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'wica-github-activity/1.0',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    })

    const json = (await res.json()) as GitHubResponse

    if (json.errors) {
      throw new Error(json.errors[0]?.message || 'GitHub API error')
    }

    const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []
    const total = json.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0

    const data = {
      total,
      weeks: weeks.map((week) => ({
        days: (week.contributionDays || []).map((day) => ({
          date: day.date,
          count: day.contributionCount,
          weekday: day.weekday,
        })),
      })),
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch {
    return new Response(JSON.stringify({ total: 0, weeks: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
