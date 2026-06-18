import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

const PLAYER_STAT_LABELS: Record<string, string> = {
  MinutesPlayed: 'Minutes',
  Goals: 'Goals',
  Assists: 'Assists',
  ShotsOnTarget: 'Shots on Target',
  ShotsOffTarget: 'Shots off Target',
  ShotsBlocked: 'Blocked',
  PassesAttempted: 'Passes Attempted',
  PassesCompleted: 'Passes Completed',
  PassAccuracy: 'Pass Accuracy',
  Tackles: 'Tackles',
  TacklesWon: 'Tackles Won',
  Interceptions: 'Interceptions',
  Clearances: 'Clearances',
  Blocks: 'Blocks',
  Fouls: 'Fouls',
  FoulsDrawn: 'Fouls Drawn',
  YellowCards: 'Yellow Cards',
  RedCards: 'Red Cards',
  Offsides: 'Offsides',
  Sprints: 'Sprints',
  DistanceCovered: 'Distance (km)',
  TopSpeed: 'Top Speed',
  Saves: 'Saves',
  GoalsConceded: 'Conceded',
  CrossesAttempted: 'Crosses',
  CrossesCompleted: 'Crosses Completed',
  DribblesAttempted: 'Dribbles',
  DribblesCompleted: 'Dribbles Completed',
  ShotAccuracy: 'Shot Accuracy',
  AerialDuelsWon: 'Aerial Duels Won',
  AerialDuelsAttempted: 'Aerial Duels',
  TotalDistance: 'Distance (km)',
  AttemptAtGoalOnTarget: 'Shots on Target',
  AttemptAtGoalOffTarget: 'Shots off Target',
  AttemptAtGoalBlocked: 'Blocked Shots',
  Corners: 'Corners',
  FoulsFor: 'Fouls',
  GoalkeeperSaves: 'Saves',
  Offside: 'Offsides',
  TakeOnsCompleted: 'Take-ons',
}

function statValue(name: string, val: number): string {
  if (name === 'TopSpeed') return val.toFixed(1)
  if (name === 'TotalDistance' || name === 'DistanceCovered') return (val / 1000).toFixed(1)
  if (name === 'PassAccuracy' || name === 'ShotAccuracy') return (val * 100).toFixed(1) + '%'
  if (name === 'MinutesPlayed') {
    const mins = Math.floor(val)
    const secs = Math.round((val - mins) * 60)
    return secs > 0 ? `${mins}' ${secs}"` : `${mins}'`
  }
  return String(Math.round(val))
}

interface PlayerStatsModalProps {
  playerId: string
  side: 'home' | 'away'
  playerName: string
  shirtNumber: number
  playerPicture?: string
  teamLogo: string
  teamName: string
  stats: any[] | null
  onClose: () => void
}

export function PlayerStatsModal({
  playerId: _playerId,
  side: _side,
  playerName,
  shirtNumber,
  playerPicture,
  teamLogo,
  teamName,
  stats,
  onClose,
}: PlayerStatsModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const entries = stats
    ? stats
        .map((s: any) => {
          const name = Array.isArray(s) ? s[0] : s.name || s.stat || ''
          const val = Array.isArray(s) ? s[1] : s.value ?? s.val ?? 0
          return { name, val: Number(val) }
        })
        .filter((s) => s.val > 0 || s.name === 'MinutesPlayed')
        .filter(Boolean)
    : []

  return createPortal(
    <div className="player-stats-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Player stats">
      <div className="player-stats-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="player-stats-header">
          <div className="player-stats-avatar">
            {playerPicture ? (
              <img src={playerPicture + '?imwidth=120'} alt="" className="player-stats-avatar-img" />
            ) : (
              <span className="player-stats-avatar-fallback">{shirtNumber}</span>
            )}
          </div>
          <div className="player-stats-header-info">
            <div className="player-stats-header-top">
              <span className="player-stats-shirt">#{shirtNumber}</span>
              <img src={teamLogo} alt="" className="player-stats-team-logo" />
            </div>
            <h2 className="player-stats-name">{playerName}</h2>
            <span className="player-stats-team-name">{teamName}</span>
          </div>
          <button type="button" className="player-stats-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" shapeRendering="crispEdges">
              <rect x="5" y="1" width="4" height="12" transform="rotate(45 7 7)" fill="currentColor" />
              <rect x="5" y="1" width="4" height="12" transform="rotate(-45 7 7)" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Stats grid */}
        {entries.length > 0 ? (
          <div className="player-stats-grid">
            {entries.map((s) => (
              <div key={s.name} className="player-stats-item">
                <span className="player-stats-item-value">{statValue(s.name, s.val)}</span>
                <span className="player-stats-item-label">{PLAYER_STAT_LABELS[s.name] || s.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="player-stats-empty">
            {stats === null
              ? 'Detailed stats not available for this match'
              : 'No stats recorded for this player'}
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}
