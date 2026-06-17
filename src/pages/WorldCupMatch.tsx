import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'

import '../styles/worldcup.css'

const STAT_LABELS: Record<string, string> = {
  Possession: 'Possession',
  AttemptAtGoalOnTarget: 'Shots on Target',
  AttemptAtGoalOffTarget: 'Shots off Target',
  AttemptAtGoalBlocked: 'Blocked Shots',
  PassesCompleted: 'Passes Completed',
  Corners: 'Corners',
  YellowCards: 'Yellow Cards',
  RedCards: 'Red Cards',
  FoulsFor: 'Fouls',
  GoalkeeperSaves: 'Saves',
  Offsides: 'Offsides',
  Goals: 'Goals',
  Assists: 'Assists',
  Sprints: 'Sprints',
  TopSpeed: 'Top Speed',
  TotalDistance: 'Distance',
  CrossesCompleted: 'Crosses Completed',
  TakeOnsCompleted: 'Take-ons Completed',
}
const STAT_ORDER = ['Possession', 'AttemptAtGoalOnTarget', 'AttemptAtGoalOffTarget', 'AttemptAtGoalBlocked', 'PassesCompleted', 'Corners', 'CrossesCompleted', 'TakeOnsCompleted', 'FoulsFor', 'YellowCards', 'RedCards', 'Offsides', 'GoalkeeperSaves', 'Sprints', 'TopSpeed', 'TotalDistance']

function fmtStat(name: string, val: number): string {
  if (name === 'TopSpeed') return val.toFixed(1)
  if (name === 'TotalDistance') return (val / 1000).toFixed(1)
  if (name === 'Possession') return (val * 100).toFixed(1)
  return String(Math.round(val))
}

function findStat(stats: any[], name: string): number | null {
  if (!Array.isArray(stats)) return null
  const entry = stats.find((s: any) => Array.isArray(s) && s[0] === name)
  return entry ? entry[1] : null
}

const KEY_EVENT_TYPES = new Set([0, 2, 3, 4, 5, 6, 34, 38, 39, 40])

const EVENT_ICONS: Record<number, string> = {
  0: '⚽',
  2: '🟨',
  3: '🟥',
  4: '⚽',
  5: '🔄',
  6: '❌',
  34: '😬',
  38: '🟨➡️🟥',
  39: '⚽',
  40: '❌',
}

function eventTypeIcon(type: number): string {
  return EVENT_ICONS[type] ?? '●'
}

export default function WorldCupMatch() {
  const { matchId } = useParams<{ matchId: string }>()
  const [data, setData] = useState<{
    details: any
    timeline: any
    stats: { home: any[]; away: any[] } | null
    powerRanking: any
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'Timeline' | 'Lineups' | 'Stats'>('Timeline')

  useEffect(() => {
    if (!matchId) return
    fetch(`/api/worldcup?matchId=${matchId}`)
      .then(r => r.json())
      .then(j => { setData(j); setLoading(false) })
      .catch(() => setLoading(false))
  }, [matchId])

  const match = data?.details
  const timeline = data?.timeline
  const stats = data?.stats
  const homeName = match?.HomeTeam?.TeamName?.[0]?.Description || 'Home'
  const awayName = match?.AwayTeam?.TeamName?.[0]?.Description || 'Away'
  const homePossession = match?.BallPossession?.Home
  const awayPossession = match?.BallPossession?.Away

  return (
    <>
      <SEO
        title={`${match ? `${homeName} ${match.HomeTeam?.Score ?? '-'}-${match.AwayTeam?.Score ?? '-'} ${awayName}` : 'Match'} — World Cup 2026`}
        description="FIFA World Cup 2026 match details"
        pathname={`/worldcup/${matchId}`}
      />
      <main id="main" className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <Link to="/#worldcup" className="text-[10px] font-mono text-muted hover:text-accent flex items-center gap-1 transition-colors uppercase tracking-widest mb-6">
          ← Back to World Cup
        </Link>

        {loading ? (
          <div className="worldcup-skeleton" aria-busy="true" aria-label="Loading match">
            <div className="worldcup-skeleton__card">
              <div className="worldcup-skeleton__row"><div className="worldcup-skeleton__avatar" /><div className="worldcup-skeleton__avatar" /></div>
              <div className="worldcup-skeleton__line" /><div className="worldcup-skeleton__line worldcup-skeleton__line--short" />
            </div>
          </div>
        ) : !match ? (
          <p className="text-center text-muted font-mono text-xs">Match not found</p>
        ) : (
          <>
            {/* Score header */}
            <div className="project-card p-6 mb-6 text-center border-border/30">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="flex flex-col items-center gap-2 w-28">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img src={match.HomeTeam?.PictureUrl?.replace('{format}','sq').replace('{size}','4')} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-sm font-semibold leading-tight">{homeName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold font-mono text-text">{match.HomeTeam?.Score ?? '-'}</span>
                  <span className="text-muted font-mono opacity-30 text-xl">-</span>
                  <span className="text-3xl font-bold font-mono text-text">{match.AwayTeam?.Score ?? '-'}</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-28">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img src={match.AwayTeam?.PictureUrl?.replace('{format}','sq').replace('{size}','4')} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-sm font-semibold leading-tight">{awayName}</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-muted uppercase tracking-wider">
                {match.StageName?.[0]?.Description} · {match.GroupName?.[0]?.Description} · {new Date(match.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Match info */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-[9px] font-mono text-muted/70 uppercase tracking-wider">
                {match.Stadium?.Name?.[0]?.Description && (
                  <span>{match.Stadium.Name[0].Description}</span>
                )}
                {match.Attendance && (
                  <span>{Number(match.Attendance).toLocaleString()} attendance</span>
                )}
                {match.Officials?.[0]?.Name?.[0]?.Description && (
                  <span>Ref: {match.Officials[0].Name[0].Description}</span>
                )}
              </div>

              {homePossession && awayPossession && (
                <div className="max-w-[220px] mx-auto mt-4">
                  <div className="flex justify-between text-[10px] font-mono text-muted mb-1">
                    <span>{homePossession}%</span>
                    <span className="text-[10px] text-text/60 uppercase tracking-wider">Possession</span>
                    <span>{awayPossession}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border flex overflow-hidden">
                    <div className="bg-accent/70 rounded-l-full transition-all" style={{ width: `${homePossession}%` }} />
                    <div className="bg-blue-400/60 rounded-r-full transition-all" style={{ width: `${awayPossession}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-border/30 pb-3 mb-6">
              {(['Timeline', 'Lineups', 'Stats'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`text-[11px] font-mono uppercase tracking-widest pb-1 transition-all ${
                    activeTab === tab ? 'text-accent border-b-2 border-accent font-bold' : 'text-muted hover:text-text'
                  }`}
                >{tab}</button>
              ))}
            </div>

            {activeTab === 'Timeline' && (
              <div className="space-y-1">
                {(timeline?.Event || [])
                  .filter((e: any) => KEY_EVENT_TYPES.has(e.Type))
                  .map((event: any, idx: number) => {
                    const isHome = event.IdTeam === match.HomeTeam?.IdTeam
                    const type = event.Type
                    const desc = event.EventDescription?.[0]?.Description || ''
                    const minute = event.MatchMinute
                    const isGoal = type === 0 || type === 4 || type === 34 || type === 39
                    const isCard = type === 2
                    const isRed = type === 3 || type === 38

                    return (
                      <motion.div
                        key={event.EventId || idx}
                        initial={{ opacity: 0, x: isHome ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex items-center gap-3 text-[11px] font-mono py-2 px-3 rounded-lg transition-colors ${
                          isGoal ? 'bg-accent/5' : isRed ? 'bg-red-500/5' : isCard ? 'bg-yellow-500/5' : 'hover:bg-surface'
                        }`}
                      >
                        <span className={`font-bold w-10 shrink-0 text-right ${isGoal ? 'text-accent' : 'text-muted/80'}`}>{minute}</span>
                        <span className="text-xs shrink-0 w-5 text-center">{eventTypeIcon(type)}</span>
                        <span className={`flex-1 ${isGoal ? 'text-text font-semibold' : 'text-text/70'}`}>{desc}</span>
                        <span className={`text-[9px] ${isHome ? 'text-accent/60' : 'text-blue-400/60'} uppercase`}>{isHome ? 'H' : 'A'}</span>
                      </motion.div>
                    )
                  })}
                {(!timeline?.Event || timeline.Event.length === 0) ? (
                  <p className="text-center text-muted font-mono text-[10px] uppercase py-12">No events recorded yet</p>
                ) : (timeline?.Event || []).filter((e: any) => KEY_EVENT_TYPES.has(e.Type)).length === 0 ? (
                  <p className="text-center text-muted font-mono text-[10px] uppercase py-12">No key events recorded</p>
                ) : null}
              </div>
            )}

            {activeTab === 'Lineups' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['HomeTeam', 'AwayTeam'].map((side) => {
                  const team = match?.[side]
                  const formation = team?.Tactics?.[0]?.Formation
                  return (
                    <div key={side} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-border/20 pb-2">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted">{team?.TeamName?.[0]?.Description}</h4>
                        {formation && <span className="text-[9px] font-mono text-muted/60">{formation.join('-')}</span>}
                      </div>
                      {/* Starting XI */}
                      <div className="space-y-1.5">
                        <p className="text-[8px] font-mono uppercase tracking-widest text-muted/40">Starting XI</p>
                        {(team?.Players || []).filter((p: any) => p.FieldStatus === 0).map((player: any) => (
                          <div key={player.IdPlayer} className="flex items-center gap-2.5 text-[11px] font-mono group py-1 px-2 rounded-lg hover:bg-surface transition-colors">
                            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-code-bg ring-1 ring-border/40">
                              {player.PlayerPicture?.PictureUrl ? (
                                <img src={player.PlayerPicture.PictureUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] text-muted/40 font-bold">{player.ShirtNumber}</div>
                              )}
                            </div>
                            <span className="text-muted/60 w-4 text-center text-[10px]">{player.ShirtNumber}</span>
                            <span className="flex-1 truncate text-text/80 group-hover:text-text font-medium">{player.PlayerName?.[0]?.Description}</span>
                            {player.Captain && <span className="text-[8px] text-accent/70 font-bold">C</span>}
                            <span className="text-[8px] text-muted/50 uppercase">{player.PositionLocalized?.[0]?.Description?.charAt(0)}</span>
                          </div>
                        ))}
                      </div>
                      {/* Substitutes */}
                      {(team?.Players || []).filter((p: any) => p.FieldStatus !== 0).length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-border/10">
                          <p className="text-[8px] font-mono uppercase tracking-widest text-muted/40">Substitutes</p>
                          {team?.Players?.filter((p: any) => p.FieldStatus !== 0).map((player: any) => (
                            <div key={player.IdPlayer} className="flex items-center gap-2.5 text-[11px] font-mono py-0.5 px-2 text-text/60">
                              <span className="text-muted/40 w-4 text-center text-[10px]">{player.ShirtNumber}</span>
                              <span className="flex-1 truncate">{player.PlayerName?.[0]?.Description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {activeTab === 'Stats' && (
              <div className="space-y-3">
                {stats ? (
                  STAT_ORDER.map((key) => {
                    const homeVal = stats.home ? findStat(stats.home, key) : null
                    const awayVal = stats.away ? findStat(stats.away, key) : null
                    if (homeVal === null && awayVal === null) return null
                    const label = STAT_LABELS[key] || key

                    if (key === 'Possession') {
                      const h = (homeVal ?? 0.5) * 100
                      const a = (awayVal ?? 0.5) * 100
                      return (
                        <div key={key} className="project-card p-3 border-border/20">
                          <div className="flex justify-between text-[10px] font-mono text-muted mb-1.5">
                            <span className="w-20 text-right">{h.toFixed(1)}%</span>
                            <span className="text-xs font-semibold text-text tracking-wider">{label}</span>
                            <span className="w-20">{a.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-border flex overflow-hidden">
                            <div className="bg-accent/70 rounded-l-full" style={{ width: `${h}%` }} />
                            <div className="bg-blue-400/60 rounded-r-full" style={{ width: `${a}%` }} />
                          </div>
                        </div>
                      )
                    }

                    const max = Math.max(homeVal ?? 0, awayVal ?? 0)
                    return (
                      <div key={key} className="flex items-center gap-3 text-[11px] font-mono py-1.5 border-b border-border/10">
                        <span className="w-8 text-right font-semibold text-text">{fmtStat(key, homeVal ?? 0)}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                            <div className="h-full bg-accent/70 rounded-full transition-all" style={{ width: max > 0 ? `${((homeVal ?? 0) / max) * 100}%` : '0%' }} />
                          </div>
                          <span className="text-[10px] text-text/60 uppercase tracking-wider text-center min-w-[60px]">{label}</span>
                          <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                            <div className="h-full bg-blue-400/60 rounded-full transition-all ml-auto" style={{ width: max > 0 ? `${((awayVal ?? 0) / max) * 100}%` : '0%' }} />
                          </div>
                        </div>
                        <span className="w-8 font-semibold text-text">{fmtStat(key, awayVal ?? 0)}</span>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted font-mono text-[10px] uppercase tracking-widest text-center">
                    <p>Detailed stats available for completed matches</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
