import { useMemo } from 'react'

interface FormationDiagramProps {
  formation: number[]
  players: any[]
  side: 'home' | 'away'
}

const POS_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return parts[0] || ''
  return parts[parts.length - 1]
}

export function FormationDiagram({ formation, players, side }: FormationDiagramProps) {
  const rows = useMemo(() => {
    const sorted = [...players].sort((a, b) => {
      const pa = POS_ORDER.indexOf(a.PositionLocalized?.[0]?.Description || '')
      const pb = POS_ORDER.indexOf(b.PositionLocalized?.[0]?.Description || '')
      return pa - pb
    })
    const counts = [1, ...formation]
    const result: { number: number; name: string }[][] = []
    let idx = 0
    for (const c of counts) {
      result.push(
        sorted.slice(idx, idx + c).map(p => ({
          number: p.ShirtNumber,
          name: shortName(p.PlayerName?.[0]?.Description || ''),
        }))
      )
      idx += c
    }
    return result
  }, [players, formation])

  const pad = 10
  const w = 320
  const h = 420
  const fw = w - pad * 2
  const fh = h - pad * 2
  const rowCount = rows.length
  const rowSpacing = fh / (rowCount + 1)
  const cy = (i: number) =>
    side === 'home'
      ? pad + fh - (i + 1) * rowSpacing
      : pad + (i + 1) * rowSpacing

  return (
    <div className="max-w-[320px] mx-auto">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-auto rounded-xl overflow-hidden"
        style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}
      >
        {/* Pitch background */}
        <rect width={w} height={h} fill="#1a5e3a" />

        {/* Field border */}
        <rect x={pad} y={pad} width={fw} height={fh} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} rx={4} />

        {/* Center line */}
        <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />

        {/* Center circle */}
        <circle cx={w / 2} cy={h / 2} r={28} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1} />

        {/* Penalty areas */}
        <rect x={pad + fw * 0.2} y={pad} width={fw * 0.6} height={fw * 0.44} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} rx={2} />
        <rect x={pad + fw * 0.2} y={h - pad - fw * 0.44} width={fw * 0.6} height={fw * 0.44} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} rx={2} />

        {/* Player rows */}
        {rows.map((row, i) =>
          row.map((player, j) => {
            const x = pad + (j + 1) * fw / (row.length + 1)
            const y = cy(i)
            return (
              <g key={`${i}-${j}`}>
                <circle cx={x} cy={y} r={14} fill="var(--surface, #1f2937)" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fill="var(--text, #f3f4f6)" fontSize={9} fontWeight="700">
                  {player.number}
                </text>
                <text x={x} y={y + 22} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={8} fontWeight="500">
                  {player.name}
                </text>
              </g>
            )
          })
        )}

        {/* Formation label */}
        <text x={w / 2} y={side === 'home' ? h - 6 : 14} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={8} fontWeight="500">
          {formation.join('-')}
        </text>
      </svg>
    </div>
  )
}
