import { useMemo } from 'react'

interface PlayerSummary {
  id: string
  number: number
  name: string
  fullName: string
  picture?: string
}

interface FormationDiagramProps {
  homePlayers: any[]
  awayPlayers: any[]
  homeFormation: number[]
  awayFormation: number[]
  homeTeam: { name: string; logo: string }
  awayTeam: { name: string; logo: string }
  onPlayerClick?: (playerId: string, side: 'home' | 'away') => void
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return parts[0] || ''
  if (parts.length === 2) return `${parts[0][0]}. ${parts[1]}`
  return `${parts[0][0]}. ${parts[parts.length - 1]}`
}

function buildRows(players: any[], formation: number[]) {
  const sorted = [...players].sort((a, b) => (a.Position ?? 0) - (b.Position ?? 0))
  const counts = [1, ...formation]
  const rows: PlayerSummary[][] = []
  let idx = 0
  for (const c of counts) {
    rows.push(
      sorted.slice(idx, idx + c).map(p => ({
        id: p.IdPlayer ?? p.PlayerId ?? '',
        number: p.ShirtNumber,
        name: shortName(p.PlayerName?.[0]?.Description || ''),
        fullName: p.PlayerName?.[0]?.Description || '',
        picture: p.PlayerPicture?.PictureUrl,
      }))
    )
    idx += c
  }
  return rows
}

const W = 680
const AWAY_HEADER = 36
const HOME_FOOTER = 36
const PITCH_TOP = AWAY_HEADER
const PITCH_BOT = W - HOME_FOOTER
const PITCH_H = PITCH_BOT - PITCH_TOP
const HALF_H = PITCH_H / 2
const CENTER_LINE = PITCH_TOP + HALF_H
const PAD = 20
const FIELD_L = PAD
const FIELD_R = W - PAD
const FIELD_W = FIELD_R - FIELD_L
const CENTER_X = W / 2

export function FormationDiagram({ homePlayers, awayPlayers, homeFormation, awayFormation, homeTeam, awayTeam, onPlayerClick }: FormationDiagramProps) {
  const homeRows = useMemo(() => buildRows(homePlayers, homeFormation), [homePlayers, homeFormation])
  const awayRows = useMemo(() => buildRows(awayPlayers, awayFormation), [awayPlayers, awayFormation])

  const homeSpacing = HALF_H / (homeRows.length + 1)
  const awaySpacing = HALF_H / (awayRows.length + 1)

  const homeCY = (i: number) => CENTER_LINE + HALF_H - (i + 1) * homeSpacing
  const awayCY = (i: number) => PITCH_TOP + (i + 1) * awaySpacing

  const PitchLine = ({ ...props }) => (
    <line {...props} stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} />
  )
  const PitchRect = ({ ...props }) => (
    <rect {...props} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} rx={2} />
  )

  return (
    <div className="max-w-[680px] mx-auto">
      <svg
        viewBox={`0 0 ${W} ${W}`}
        className="w-full h-auto rounded-xl overflow-hidden shadow-lg"
        style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
      >
        {/* ── Pitch background ────────────────────────── */}
        <rect width={W} height={W} fill="#2d6a4f" />

        {/* ── Pitch markings ──────────────────────────── */}
        <PitchRect x={FIELD_L} y={PITCH_TOP} width={FIELD_W} height={PITCH_H} />
        <PitchLine x1={FIELD_L} y1={CENTER_LINE} x2={FIELD_R} y2={CENTER_LINE} />
        <circle cx={CENTER_X} cy={CENTER_LINE} r={50} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
        <circle cx={CENTER_X} cy={CENTER_LINE} r={3} fill="rgba(255,255,255,0.25)" />

        {/* Penalty boxes */}
        <PitchRect x={CENTER_X - 200} y={PITCH_TOP} width={400} height={HALF_H * 0.42} />
        <PitchRect x={CENTER_X - 200} y={PITCH_BOT - HALF_H * 0.42} width={400} height={HALF_H * 0.42} />

        {/* Goal boxes */}
        <PitchRect x={CENTER_X - 85} y={PITCH_TOP} width={170} height={HALF_H * 0.14} />
        <PitchRect x={CENTER_X - 85} y={PITCH_BOT - HALF_H * 0.14} width={170} height={HALF_H * 0.14} />

        {/* Penalty spots */}
        <circle cx={CENTER_X} cy={PITCH_TOP + HALF_H * 0.33} r={3} fill="rgba(255,255,255,0.25)" />
        <circle cx={CENTER_X} cy={PITCH_BOT - HALF_H * 0.33} r={3} fill="rgba(255,255,255,0.25)" />

        {/* ── Away team header ────────────────────────── */}
        <rect x={0} y={0} width={W} height={AWAY_HEADER} fill="#1b4d3a" />
        <image href={awayTeam.logo} x={10} y={8} width={20} height={20} />
        <text x={36} y={AWAY_HEADER / 2 + 1} dominantBaseline="central" fill="rgba(255,255,255,0.9)" fontSize={12} fontWeight="600">{awayTeam.name}</text>
        <rect x={W - 14 - 60} y={8} width={60} height={20} rx={10} fill="#245e40" />
        <text x={W - 14 - 30} y={AWAY_HEADER / 2 + 1} dominantBaseline="central" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10} fontWeight="500">{awayFormation.join('-')}</text>

        {/* ── Home team footer ────────────────────────── */}
        <rect x={0} y={PITCH_BOT} width={W} height={HOME_FOOTER} fill="#1b4d3a" />
        <image href={homeTeam.logo} x={10} y={PITCH_BOT + 8} width={20} height={20} />
        <text x={36} y={PITCH_BOT + HOME_FOOTER / 2 + 1} dominantBaseline="central" fill="rgba(255,255,255,0.9)" fontSize={12} fontWeight="600">{homeTeam.name}</text>
        <rect x={W - 14 - 60} y={PITCH_BOT + 8} width={60} height={20} rx={10} fill="#245e40" />
        <text x={W - 14 - 30} y={PITCH_BOT + HOME_FOOTER / 2 + 1} dominantBaseline="central" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10} fontWeight="500">{homeFormation.join('-')}</text>

        {/* ── Defs: clip paths for player avatars ─────── */}
        <defs>
          {awayRows.flatMap((row, i) =>
            row.map((_, j) => (
              <clipPath key={`away-${i}-${j}`} id={`ap-${i}-${j}`} clipPathUnits="objectBoundingBox">
                <circle cx={0.5} cy={0.37} r={0.5} />
              </clipPath>
            ))
          )}
          {homeRows.flatMap((row, i) =>
            row.map((_, j) => (
              <clipPath key={`home-${i}-${j}`} id={`hp-${i}-${j}`} clipPathUnits="objectBoundingBox">
                <circle cx={0.5} cy={0.37} r={0.5} />
              </clipPath>
            ))
          )}
        </defs>

        {/* ── Away players (GK at top) ────────────────── */}
        {awayRows.map((row, i) =>
          row.map((player, j) => {
            const x = FIELD_L + (j + 1) * FIELD_W / (row.length + 1)
            const y = awayCY(i)
            return (
              <g key={`away-${i}-${j}`} style={{ cursor: onPlayerClick ? 'pointer' : undefined }} onClick={() => onPlayerClick?.(player.id, 'away')}>
                <circle cx={x} cy={y} r={22} fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                {player.picture ? (
                  <image
                    href={player.picture + "?imwidth=80"}
                    x={x - 22} y={y - 30}
                    width={44} height={60}
                    preserveAspectRatio="xMidYMin slice"
                    clipPath={`url(#ap-${i}-${j})`}
                  />
                ) : (
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.8)" fontSize={13} fontWeight="700">
                    {player.number}
                  </text>
                )}
                <circle cx={x - 14} cy={y + 14} r={9} fill="#1a1a2e" stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                <text x={x - 14} y={y + 14 + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={8} fontWeight="700">
                  {player.number}
                </text>
                <text x={x} y={y + 32} textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize={9} fontWeight="500" style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.4)', strokeWidth: '2px', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                  {player.name}
                </text>
              </g>
            )
          })
        )}

        {/* ── Home players (GK at bottom) ─────────────── */}
        {homeRows.map((row, i) =>
          row.map((player, j) => {
            const x = FIELD_L + (j + 1) * FIELD_W / (row.length + 1)
            const y = homeCY(i)
            return (
              <g key={`home-${i}-${j}`} style={{ cursor: onPlayerClick ? 'pointer' : undefined }} onClick={() => onPlayerClick?.(player.id, 'home')}>
                <circle cx={x} cy={y} r={22} fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                {player.picture ? (
                  <image
                    href={player.picture + "?imwidth=80"}
                    x={x - 22} y={y - 30}
                    width={44} height={60}
                    preserveAspectRatio="xMidYMin slice"
                    clipPath={`url(#hp-${i}-${j})`}
                  />
                ) : (
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.8)" fontSize={13} fontWeight="700">
                    {player.number}
                  </text>
                )}
                <circle cx={x - 14} cy={y + 14} r={9} fill="#1a1a2e" stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
                <text x={x - 14} y={y + 14 + 1} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={8} fontWeight="700">
                  {player.number}
                </text>
                <text x={x} y={y + 32} textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize={9} fontWeight="500" style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.4)', strokeWidth: '2px', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                  {player.name}
                </text>
              </g>
            )
          })
        )}
      </svg>
    </div>
  )
}
