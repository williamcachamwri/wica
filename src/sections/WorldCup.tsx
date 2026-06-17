import { SectionDivider } from '../components/SectionDivider'
import type { Match, Standing, MatchDetails } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import '../styles/worldcup.css'

type Tab = 'Matches' | 'Standings' | 'Power Rankings'

export function WorldCup() {
  const [data, setData] = useState<{ matches: Match[]; standings: Standing[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('Matches')
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null)
  const [detailsLoading, setMatchDetailsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/worldcup')
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedMatchId) {
      setMatchDetailsLoading(true)
      fetch(`/api/worldcup?matchId=${selectedMatchId}`)
        .then((res) => res.json())
        .then((json) => {
          setMatchDetails(json)
          setMatchDetailsLoading(false)
        })
        .catch(() => setMatchDetailsLoading(false))
    } else {
      setMatchDetails(null)
    }
  }, [selectedMatchId])

  if (loading || !data) {
    return (
      <section id="worldcup" className="mb-14 opacity-50">
        <SectionDivider label="FIFA World Cup 2026™" />
        <div className="h-40 flex items-center justify-center font-mono text-[10px] text-muted uppercase tracking-widest">
          <span className="animate-pulse">Loading tournament data...</span>
        </div>
      </section>
    )
  }

  const { matches, standings } = data

  return (
    <section id="worldcup" className="mb-14 scroll-mt-20">
      <SectionDivider label="FIFA World Cup 2026™" />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-surface-lighter rounded-lg border border-border/40 w-fit mx-auto">
        {(['Matches', 'Standings', 'Power Rankings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              setSelectedMatchId(null)
            }}
            className={`px-4 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wider transition-all ${
              activeTab === tab 
                ? 'bg-surface shadow-sm text-accent font-bold' 
                : 'text-muted hover:text-text hover:bg-surface/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'Matches' && (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence mode="wait">
              {selectedMatchId ? (
                <motion.div
                  key="match-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={() => setSelectedMatchId(null)}
                    className="text-[10px] font-mono text-muted hover:text-accent flex items-center gap-1 transition-colors uppercase tracking-widest"
                  >
                    ← Back to matches
                  </button>
                  
                  {detailsLoading ? (
                    <div className="h-60 flex items-center justify-center font-mono text-[10px] text-muted uppercase tracking-widest">
                      <span className="animate-pulse">Loading match details...</span>
                    </div>
                  ) : matchDetails ? (
                    <MatchDetailView details={matchDetails} />
                  ) : null}
                </motion.div>
              ) : (
                <motion.div
                  key="matches-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 gap-3"
                >
                  {matches.slice(0, 10).map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      onClick={() => setSelectedMatchId(match.id)} 
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'Standings' && (
          <div className="space-y-8">
            {standings.map((group) => (
              <div key={group.group} className="project-card p-4 overflow-hidden border-border/30">
                <h3 className="wc-table-header mb-4 px-1 flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                  {group.group}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full wc-table text-[11px] font-mono">
                    <thead>
                      <tr className="text-muted/60 border-b border-border/50">
                        <th className="w-8">#</th>
                        <th>Team</th>
                        <th className="text-center w-8">MP</th>
                        <th className="text-center w-8">GD</th>
                        <th className="text-center w-8 font-bold">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {group.teams.map((team) => (
                        <tr key={team.code} className="hover:bg-accent/[0.03] transition-colors group">
                          <td className="text-muted/60">{team.rank}</td>
                          <td>
                            <div className="flex items-center gap-2 py-0.5">
                              <div className="w-4 h-4 flex items-center justify-center overflow-hidden">
                                <img src={team.logo} alt={team.code} className="wc-team-logo-small" />
                              </div>
                              <span className="font-semibold text-text/80 group-hover:text-accent transition-colors">
                                {team.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-center text-muted/80">{team.mp}</td>
                          <td className="text-center text-muted/80">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                          <td className="text-center font-bold text-text">{team.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Power Rankings' && (
          <div className="project-card p-8 flex flex-col items-center justify-center gap-4 text-center border-dashed">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1 text-text">Power Rankings coming soon</p>
              <p className="text-[10px] text-muted font-mono uppercase tracking-tighter">Realtime analysis of team performance</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function MatchCard({ match, onClick }: { match: Match; onClick: () => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="project-card wc-card group p-4 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
            match.status === 'LIVE' 
              ? 'wc-status-live animate-wc-pulse' 
              : 'bg-surface text-muted border border-border/50'
          }`}>
            {match.status}
          </span>
          <span className="text-[11px] text-muted font-mono">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <span className="text-[11px] text-muted font-mono uppercase tracking-tight">{match.group || match.stage}</span>
      </div>

      <div className="flex items-center justify-center gap-6 py-2">
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div className="wc-logo-container shadow-sm group-hover:shadow-md transition-shadow">
            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-semibold text-center leading-tight truncate w-full px-1 text-text">{match.homeTeam.name}</span>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="flex items-center gap-4">
            <span className="wc-score text-text">{match.homeTeam.score ?? 0}</span>
            <span className="text-muted font-mono opacity-30 text-xl">-</span>
            <span className="wc-score text-text">{match.awayTeam.score ?? 0}</span>
          </div>
          {match.venue && (
            <span className="text-[9px] text-muted/70 text-center max-w-[120px] leading-tight font-mono uppercase tracking-tighter">
              {match.venue}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div className="wc-logo-container shadow-sm group-hover:shadow-md transition-shadow">
            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-semibold text-center leading-tight truncate w-full px-1 text-text">{match.awayTeam.name}</span>
        </div>
      </div>
    </motion.article>
  )
}

function MatchDetailView({ details }: { details: MatchDetails }) {
  const [activeSubTab, setActiveTab] = useState<'Overview' | 'Lineups' | 'Stats'>('Overview')
  const { details: match, timeline } = details

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-border/30 pb-4">
        {(['Overview', 'Lineups', 'Stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[11px] font-mono uppercase tracking-widest pb-1 transition-all ${
              activeSubTab === tab ? 'text-accent border-b-2 border-accent font-bold' : 'text-muted hover:text-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-40">
        {activeSubTab === 'Overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {(timeline.Event || []).slice(0, 8).map((event: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-[11px] font-mono py-1 border-b border-border/10">
                  <span className="text-accent w-8 shrink-0">{event.MatchMinute}'</span>
                  <span className="text-text/80">{event.EventDescription?.[0]?.Description}</span>
                </div>
              ))}
            </div>
            {(!timeline.Event || timeline.Event.length === 0) && (
              <p className="text-center text-muted font-mono text-[10px] uppercase">No events recorded yet</p>
            )}
          </div>
        )}

        {activeSubTab === 'Lineups' && (
          <div className="grid grid-cols-2 gap-8">
            {['HomeTeam', 'AwayTeam'].map((side) => (
              <div key={side} className="space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted border-b border-border/20 pb-1">
                  {match[side]?.TeamName?.[0]?.Description}
                </h4>
                <div className="space-y-1.5">
                  {(match[side]?.Players || []).map((player: any) => (
                    <div key={player.IdPlayer} className="flex items-center justify-between text-[11px] font-mono group">
                      <span className="text-muted w-4">{player.ShirtNumber}</span>
                      <span className="flex-1 truncate px-2 text-text/80 group-hover:text-text">{player.PlayerName?.[0]?.Description}</span>
                      <span className="text-[9px] text-muted/60 uppercase">{player.PositionLocalized?.[0]?.Description?.charAt(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'Stats' && (
          <div className="space-y-6 flex flex-col items-center justify-center h-40 text-muted font-mono text-[10px] uppercase tracking-widest text-center">
            Detailed stats available during live matches
          </div>
        )}
      </div>
    </div>
  )
}
