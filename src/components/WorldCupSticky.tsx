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
      } catch { }
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
    if (!match) return
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