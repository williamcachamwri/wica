import { jsonOK, jsonError } from '../utils/security'

const FIFA_API_BASE = 'https://api.fifa.com/api/v3'
const FDH_API_BASE = 'https://fdh-api.fifa.com/v1'
const COMPETITION_ID = '17'
const SEASON_ID = '285023'

export interface Team {
  idTeam: string
  name: string
  abbreviation: string
  logo: string
  score: number | null
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: string
  status: string
  venue: string
  group: string
  stage: string
  matchNumber: number
}

export interface Standing {
  group: string
  teams: {
    rank: number
    name: string
    code: string
    mp: number
    w: number
    d: number
    l: number
    gd: number
    pts: number
    logo: string
  }[]
}

function desc(arr: { Description?: string }[] | undefined, fallback = ''): string {
  return arr?.[0]?.Description ?? fallback
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:151.0) Gecko/20100101 Firefox/151.0'
    }
  })
  if (!res.ok) throw new Error(`FIFA API error: ${res.status}`)
  return res.json()
}

async function fetchFromFifa(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${FIFA_API_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return fetchJson(url.toString())
}

function mapTeam(data: any): Team {
  if (!data) return { idTeam: '', name: 'TBD', abbreviation: 'TBD', logo: '', score: null }
  return {
    idTeam: data.IdTeam || '',
    name: desc(data.TeamName, 'TBD'),
    abbreviation: data.Abbreviation || 'TBD',
    logo: (data.PictureUrl || '').replace('{format}', 'sq').replace('{size}', '4'),
    score: data.Score ?? null,
  }
}

function mapMatch(m: any): Match {
  return {
    id: m.IdMatch,
    homeTeam: mapTeam(m.Home),
    awayTeam: mapTeam(m.Away),
    date: m.Date,
    status: m.MatchStatus === 0 ? 'FT' : m.MatchStatus === 3 ? 'LIVE' : 'UPCOMING',
    venue: desc(m.Stadium?.Name),
    group: desc(m.GroupName),
    stage: desc(m.StageName),
    matchNumber: m.MatchNumber
  }
}

function statValue(stats: [string, number, boolean][], name: string): number | null {
  const entry = stats.find(s => s[0] === name)
  return entry ? entry[1] : null
}

export async function onRequest(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url)
  const matchId = url.searchParams.get('matchId')

  try {
    // Fetch matches always
    const matchesData = await fetchFromFifa('/calendar/matches', {
      language: 'en',
      count: '500',
      idSeason: SEASON_ID,
    })
    const matches = matchesData.Results.map(mapMatch)

    // Fetch standings for each stage
    const stageIds = [...new Set<string>(matchesData.Results.map((m: any) => m.IdStage))].filter(Boolean)
    const standingsResults = await Promise.all(
      stageIds.map((stageId: string) =>
        fetchFromFifa(`/calendar/${COMPETITION_ID}/${SEASON_ID}/${stageId}/standing`, {
          language: 'en',
          count: '200',
        }).then(d => ({ stageId, data: d.Results || [] }))
          .catch(() => ({ stageId, data: [] }))
      )
    )

    const standings: Standing[] = []
    for (const { data } of standingsResults) {
      for (const curr of data) {
        const groupName = desc(curr.Group)
        if (!groupName) continue
        let group = standings.find(g => g.group === groupName)
        if (!group) {
          group = { group: groupName, teams: [] }
          standings.push(group)
        }
        group.teams.push({
          rank: curr.Position,
          name: desc(curr.Team?.Name),
          code: curr.Team?.IdAssociation || '',
          mp: curr.Played || 0,
          w: curr.Won || 0,
          d: curr.Drawn || 0,
          l: curr.Lost || 0,
          gd: curr.GoalsDiference || 0,
          pts: curr.Points || 0,
          logo: (curr.Team?.PictureUrl || '').replace('{format}', 'sq').replace('{size}', '1'),
        })
      }
    }

    if (matchId) {
      const [details, timeline] = await Promise.all([
        fetchFromFifa(`/live/football/${matchId}`, { language: 'en' }),
        fetchFromFifa(`/timelines/${matchId}`, { language: 'en' })
      ])

      // Fetch FDH stats if available
      const idIfes = details?.Properties?.IdIFES
      let stats: { home: any[]; away: any[] } | null = null
      let playerStats: Record<string, any[]> | null = null
      let powerRanking: any = null

      if (idIfes) {
        const [teamsRaw, playersRaw, powerRaw] = await Promise.all([
          fetchJson(`${FDH_API_BASE}/stats/match/${idIfes}/teams.json`).catch(() => null),
          fetchJson(`${FDH_API_BASE}/stats/match/${idIfes}/players.json`).catch(() => null),
          fetchJson(`${FDH_API_BASE}/powerranking/match/${idIfes}.json`).catch(() => null),
        ])

        if (teamsRaw) {
          const homeId = details.HomeTeam?.IdTeam
          const awayId = details.AwayTeam?.IdTeam
          stats = {
            home: teamsRaw[homeId] || [],
            away: teamsRaw[awayId] || [],
          }
        }

        if (playersRaw) playerStats = playersRaw
        if (powerRaw) powerRanking = powerRaw
      }

      return jsonOK({ details, timeline, stats, playerStats, powerRanking, matches, standings })
    }

    return jsonOK({ matches, standings })
  } catch (error: any) {
    return jsonError(`Failed to fetch World Cup data: ${error.message}`, 500)
  }
}
