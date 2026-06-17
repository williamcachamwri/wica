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

export interface Goal {
  minute: string
  scorer: string
  team: 'home' | 'away'
  assist?: string
  ownGoal?: boolean
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
  minute?: string
  goals?: Goal[]
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

const desc = (arr: { Description?: string }[] | undefined, fallback = ''): string =>
  arr?.[0]?.Description ?? fallback

const fetchJson = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:151.0) Gecko/20100101 Firefox/151.0'
    }
  })
  if (!res.ok) throw new Error(`FIFA API error: ${res.status}`)
  return res.json()
}

const fetchFromFifa = async (path: string, params: Record<string, string> = {}) => {
  const url = new URL(`${FIFA_API_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return fetchJson(url.toString())
}

const mapTeam = (data: any): Team => {
  if (!data) return { idTeam: '', name: 'TBD', abbreviation: 'TBD', logo: '', score: null }
  return {
    idTeam: data.IdTeam || '',
    name: desc(data.TeamName, 'TBD'),
    abbreviation: data.Abbreviation || 'TBD',
    logo: (data.PictureUrl || '').replace('{format}', 'sq').replace('{size}', '4'),
    score: data.Score ?? null,
  }
}

const mapMatch = (m: any): Match => ({
  id: m.IdMatch,
  homeTeam: mapTeam(m.Home),
  awayTeam: mapTeam(m.Away),
  date: m.Date,
  status: m.MatchStatus === 0 ? 'FT' : m.MatchStatus === 3 ? 'LIVE' : 'UPCOMING',
  venue: desc(m.Stadium?.Name),
  group: desc(m.GroupName),
  stage: desc(m.StageName),
  matchNumber: m.MatchNumber,
  minute: m.MatchTime || undefined,
})

const extractGoals = (timeline: any, homeId: string): Goal[] => {
  const events = timeline?.Event || []
  return events
    .filter((e: any) => e.Type === 0 || e.Type === 4 || e.Type === 34 || e.Type === 39)
    .map((ge: any) => {
      const descText = ge.EventDescription?.[0]?.Description || ''
      const match = descText.match(/^(.+?)\s+\(.*?\)\s+scores/)
      let scorer = match ? match[1].trim() : descText.replace(/\s+scores.*$/i, '').replace(/\s+\(.*?\)\s*$/, '').trim()
      scorer = scorer.replace(/\s*\(own goal\).*$/i, '').trim()
      let team: 'home' | 'away' = ge.IdTeam === homeId ? 'home' : 'away'
      const ownGoal = ge.Type === 34 || /own goal/i.test(descText)
      if (ownGoal) team = team === 'home' ? 'away' : 'home'

      const assist = events.find((ae: any) => ae.Type === 1 && ae.MatchMinute === ge.MatchMinute)
      const assistName = assist?.EventDescription?.[0]?.Description
        ?.replace(/^Assisted by /, '')
        ?.replace(/\.$/, '') || ''

      return { minute: (ge.MatchMinute || '').replace(/['']/g, ''), scorer, team, ...(assistName ? { assist: assistName } : {}), ...(ownGoal ? { ownGoal: true } : {}) }
    })
}

export async function onRequest(context: { request: Request }): Promise<Response> {
  const url = new URL(context.request.url)
  const matchId = url.searchParams.get('matchId')

  try {
    const matchesData = await fetchFromFifa('/calendar/matches', {
      language: 'en',
      count: '500',
      idSeason: SEASON_ID,
    })
    const rawMatches: any[] = matchesData.Results || []
    const matches: Match[] = rawMatches.map(mapMatch)

    const stageIds = [...new Set<string>(rawMatches.map((m: any) => m.IdStage))].filter(Boolean)
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

    const ftMatches = matches.filter(m => m.status === 'FT').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const liveMatches = matches.filter(m => m.status === 'LIVE')
    const upcomingMatches = matches.filter(m => m.status === 'UPCOMING').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (matchId) {
      const [details, timeline] = await Promise.all([
        fetchFromFifa(`/live/football/${matchId}`, { language: 'en' }),
        fetchFromFifa(`/timelines/${matchId}`, { language: 'en' })
      ])

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

      const allMatches = [...liveMatches, ...ftMatches, ...upcomingMatches]
      return jsonOK({ details, timeline, stats, playerStats, powerRanking, matches: allMatches, standings })
    }

    const recentFt = ftMatches.slice(0, 5)
    const rawLookup = new Map(rawMatches.map((m: any) => [String(m.IdMatch), m]))
    const timelineTargets = [...recentFt, ...liveMatches]
    const timelineResults = await Promise.all(
      timelineTargets.map(m =>
        fetchFromFifa(`/timelines/${m.id}`, { language: 'en' })
          .then(tl => ({ id: m.id, timeline: tl }))
          .catch(() => null)
      )
    )

    for (const result of timelineResults) {
      if (!result) continue
      const raw = rawLookup.get(String(result.id))
      const homeId = raw?.Home?.IdTeam
      if (!homeId) continue
      const matchObj = matches.find(m => m.id === result.id)
      if (matchObj) {
        matchObj.goals = extractGoals(result.timeline, homeId)
      }
    }

    return jsonOK({
      matches: [...liveMatches, ...ftMatches, ...upcomingMatches],
      standings,
      nextMatch: upcomingMatches.length > 0 ? upcomingMatches[0] : null,
    })
  } catch (error: any) {
    return jsonError(`Failed to fetch World Cup data: ${error.message}`, 500)
  }
}