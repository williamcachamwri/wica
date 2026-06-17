import { SectionDivider } from '../components/SectionDivider'
import type { Match, Standing } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import '../styles/worldcup.css'

const tabVariants = {
  enter: { opacity: 0, y: 8, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } },
}

type Tab = 'Matches' | 'Standings' | 'Power Rankings'
const PER_PAGE = 5
const REFRESH_INTERVAL = 30000

function getStatusScore(m: Match): number {
  if (m.status === 'LIVE') return 0
  if (m.status === 'FT') return 1
  return 2
}

export function WorldCup() {
  const navigate = useNavigate()
  const [data, setData] = useState<{ matches: Match[]; standings: Standing[]; nextMatch?: Match | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('Matches')
  const [page, setPage] = useState(0)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000)
  const [groupFilter, setGroupFilter] = useState('')

  const fetchData = useCallback(() => {
    setCountdown(REFRESH_INTERVAL / 1000)
    fetch('/api/worldcup')
      .then((res) => res.json())
      .then((json) => {
        if (json && !json.error) {
          setData(json)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  // Reset page & filter when tab changes
  useEffect(() => { setPage(0); setGroupFilter('') }, [activeTab])

  const location = useLocation()
  useEffect(() => {
    if (new URLSearchParams(location.search).get('scrollTo') !== 'worldcup') return
    window.history.replaceState({}, '', location.pathname)
    const el = document.getElementById('worldcup')
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
    const observer = new MutationObserver(() => {
      const e = document.getElementById('worldcup')
      if (e) { e.scrollIntoView({ behavior: 'smooth' }); observer.disconnect() }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [location.search, location.pathname])

  if (loading || !data) {
    return (
      <section id="worldcup" className="mb-14">
        <SectionDivider label="FIFA World Cup 2026™" />
        <div className="worldcup-skeleton" aria-busy="true" aria-label="Loading tournament data">
          <div className="worldcup-skeleton__card">
            <div className="worldcup-skeleton__row">
              <div className="worldcup-skeleton__avatar" />
              <div className="worldcup-skeleton__avatar" />
            </div>
            <div className="worldcup-skeleton__line" />
          </div>
          <div className="worldcup-skeleton__card">
            <div className="worldcup-skeleton__row">
              <div className="worldcup-skeleton__avatar" />
              <div className="worldcup-skeleton__avatar" />
            </div>
            <div className="worldcup-skeleton__line worldcup-skeleton__line--short" />
          </div>
          <div className="worldcup-skeleton__card">
            <div className="worldcup-skeleton__row">
              <div className="worldcup-skeleton__avatar" />
              <div className="worldcup-skeleton__avatar" />
            </div>
            <div className="worldcup-skeleton__line" />
          </div>
        </div>
      </section>
    )
  }

  const { matches, standings, nextMatch } = data

  const groups = [...new Set(matches.map(m => m.group).filter(Boolean))].sort()
  const filtered = groupFilter ? matches.filter(m => m.group === groupFilter) : matches
  const ftMatches = filtered.filter(m => m.status === 'FT')
  const liveMatches = filtered.filter(m => m.status === 'LIVE')
  const totalPages = Math.max(1, Math.ceil(ftMatches.length / PER_PAGE))
  const currentFt = ftMatches.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <section id="worldcup" className="mb-14 scroll-mt-20">
      <SectionDivider label="FIFA World Cup 2026™" />

      <div className="flex items-center gap-1 mb-6 p-1 bg-surface-lighter rounded-lg border border-border/40 w-fit mx-auto relative">
        {(['Matches', 'Standings', 'Power Rankings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wider transition-colors relative ${
              activeTab === tab 
                ? 'text-accent font-bold' 
                : 'text-muted hover:text-text'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="wc-tab-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'Matches' && (
            <motion.div key="matches" variants={tabVariants} initial="enter" animate="center" exit="exit">

              {/* Group filter */}
              {groups.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
                  <button onClick={() => setGroupFilter('')}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider transition-colors ${
                      !groupFilter ? 'bg-accent/15 text-accent font-semibold' : 'text-muted/60 hover:text-text bg-surface-lighter'
                    }`}
                  >All</button>
                  {groups.map(g => (
                    <button key={g} onClick={() => setGroupFilter(g)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider transition-colors ${
                        groupFilter === g ? 'bg-accent/15 text-accent font-semibold' : 'text-muted/60 hover:text-text bg-surface-lighter'
                      }`}
                    >{g}</button>
                  ))}
                </div>
              )}

              {liveMatches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-semibold">Live</span>
                  </div>
                  {liveMatches.map(match => (
                    <MatchCard key={match.id} match={match} onClick={() => navigate(`/worldcup/${match.id}`)} />
                  ))}
                </div>
              )}
              {nextMatch && (!groupFilter || nextMatch.group === groupFilter) && (
                <div className="project-card p-4 border-accent/40 border-2 bg-accent/[0.03] relative overflow-hidden mb-6">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-accent/10 text-[8px] font-mono uppercase tracking-widest text-accent rounded-bl-lg">Next Match</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">Upcoming</span>
                    <span className="text-[10px] font-mono text-muted">{new Date(nextMatch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <MatchCard match={nextMatch} onClick={() => navigate(`/worldcup/${nextMatch.id}`)} prominent />
                </div>
              )}
              <div className="mt-6">
                {ftMatches.length > 0 && (
                  <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-semibold">Finished</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                {currentFt.map((match) => (
                  <MatchCard key={match.id} match={match} onClick={() => navigate(`/worldcup/${match.id}`)} />
                ))}
              </div>
                </>
                )}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition-colors text-muted hover:text-text">Previous</button>
                  <span className="text-[10px] font-mono text-muted">{page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/40 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition-colors text-muted hover:text-text">Next</button>
                </div>
              )}
              {!groupFilter && ftMatches.length === 0 && liveMatches.length === 0 && (
                <p className="text-center text-muted font-mono text-[10px] uppercase py-12">No matches found</p>
              )}
              {groupFilter && filtered.length === 0 && (
                <p className="text-center text-muted font-mono text-[10px] uppercase py-12">No matches in {groupFilter}</p>
              )}
              </div>
            </motion.div>
          )}

          {activeTab === 'Standings' && (
            <motion.div key="standings" variants={tabVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
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
                                <span className="font-semibold text-text/80 group-hover:text-accent transition-colors">{team.name}</span>
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
            </motion.div>
          )}

          {activeTab === 'Power Rankings' && (
            <motion.div key="power" variants={tabVariants} initial="enter" animate="center" exit="exit">
              <div className="project-card p-8 flex flex-col items-center justify-center gap-4 text-center border-dashed">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1 text-text">Power Rankings coming soon</p>
                  <p className="text-[10px] text-muted font-mono uppercase tracking-tighter">Realtime analysis of team performance</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function MatchCard({ match, onClick, prominent }: { match: Match; onClick: () => void; prominent?: boolean }) {
  const homeGoals = match.goals?.filter(g => g.team === 'home') || []
  const awayGoals = match.goals?.filter(g => g.team === 'away') || []
  const hasGoals = homeGoals.length > 0 || awayGoals.length > 0

  return (
    <motion.article
      initial={prominent ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={prominent ? { opacity: 1, y: 0 } : undefined}
      whileInView={prominent ? undefined : { opacity: 1, y: 0 }}
      viewport={prominent ? undefined : { once: true }}
      onClick={onClick}
      className={`project-card wc-card group p-4 cursor-pointer transition-all ${prominent ? 'hover:border-accent/60' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
            match.status === 'LIVE' 
              ? 'wc-status-live animate-wc-pulse' 
              : 'bg-surface text-muted border border-border/50'
          }`}>
            {match.status === 'LIVE' ? `LIVE${match.minute ? ` ${match.minute}'` : ''}` : match.status}
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

      {/* Goal scorers */}
      {hasGoals && (
        <div className="mt-2 pt-2 border-t border-border/10 flex justify-center gap-6 text-[10px] font-mono">
          <div className="flex flex-col items-end gap-0.5 w-[40%]">
            {homeGoals.map((g, i) => (
              <span key={i} className="text-accent/80 truncate max-w-full">{g.scorer}{g.ownGoal ? ' (OG)' : ''} <span className="text-muted/60">{g.minute}'</span></span>
            ))}
          </div>
          <div className="w-8 shrink-0" />
          <div className="flex flex-col items-start gap-0.5 w-[40%]">
            {awayGoals.map((g, i) => (
              <span key={i} className="text-blue-400/80 truncate max-w-full">{g.scorer}{g.ownGoal ? ' (OG)' : ''} <span className="text-muted/60">{g.minute}'</span></span>
            ))}
          </div>
        </div>
      )}
    </motion.article>
  )
}
