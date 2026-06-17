import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Match } from '../types'

interface WorldCupData {
  matches: Match[]
  nextMatch: Match | null
}

export function WorldCupSticky() {
  const navigate = useNavigate()
  const [data, setData] = useState<WorldCupData | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      try {
        const res = await fetch('/api/worldcup')
        if (!res.ok) return
        const json = await res.json()
        if (mounted && json && !json.error) setData(json)
      } catch {}
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  if (!data) return null

  const liveMatch = data.matches.find(m => m.status === 'LIVE')
  const match = liveMatch || data.nextMatch
  if (!match) return null

  const isLive = !!liveMatch
  const isUpcoming = match.status === 'UPCOMING'

  function handleClick() {
    navigate(`/worldcup/${match.id}`)
    setCollapsed(true)
  }

  return (
    <motion.div
      className={`worldcup-sticky${collapsed ? ' worldcup-sticky--collapsed' : ''}`}
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.8 }}
    >
      <div className="worldcup-sticky__body-wrapper">
        <button
          type="button"
          className="worldcup-sticky__body"
          onClick={handleClick}
        >
          {isLive && <span className="worldcup-sticky__live" />}
          {!isLive && (
            <svg className="worldcup-sticky__trophy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          )}
          <div className="worldcup-sticky__teams">
            <div className="worldcup-sticky__team">
              <img src={match.homeTeam.logo} alt="" className="worldcup-sticky__crest" />
              <span className="worldcup-sticky__name">{match.homeTeam.name}</span>
            </div>
            {isUpcoming ? (
              <span className="worldcup-sticky__vs">vs</span>
            ) : (
              <span className="worldcup-sticky__score">{match.homeTeam.score ?? '-'}&ndash;{match.awayTeam.score ?? '-'}</span>
            )}
            <div className="worldcup-sticky__team worldcup-sticky__team--away">
              <img src={match.awayTeam.logo} alt="" className="worldcup-sticky__crest" />
              <span className="worldcup-sticky__name">{match.awayTeam.name}</span>
            </div>
          </div>
          <span className="worldcup-sticky__meta">
            {isLive ? (
              <span className="worldcup-sticky__live-label">LIVE</span>
            ) : (
              new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            )}
          </span>
        </button>
      </div>

      <button
        type="button"
        className="worldcup-sticky__toggle"
        onClick={() => setCollapsed(c => !c)}
        aria-label={collapsed ? 'Show World Cup widget' : 'Hide World Cup widget'}
      >
        <motion.svg
          width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <polyline points="9 18 15 12 9 6" />
        </motion.svg>
      </button>
    </motion.div>
  )
}
