import { useEffect, useMemo, useRef, useState } from 'react'

export interface InsightsDataPoint {
  date: string
  sessions: number
  visitors: number
}

interface InsightsChartProps {
  title?: string
  dateRangeLabel?: string
  data?: InsightsDataPoint[]
  figLabel?: string
  onToggleMock?: () => void
  mockActive?: boolean
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
  })
}

function formatNumber(n: number) {
  return n.toLocaleString('en-US')
}

export function generateMockInsightsData(days = 35): InsightsDataPoint[] {
  const data: InsightsDataPoint[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const t = i / days
    const base = Math.sin(t * Math.PI * 3) * 80 + 120
    const visitors = Math.max(20, Math.round(base + Math.random() * 60 - 30))
    const sessions = Math.max(30, Math.round(visitors * (1.1 + Math.random() * 0.4)))
    data.push({
      date: date.toISOString().split('T')[0],
      visitors,
      sessions,
    })
  }
  return data
}

function catmullRom2bezier(points: { x: number; y: number }[], tension = 0.5): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2

    const cp1x = p1.x + (p2.x - p0.x) / 6 * tension
    const cp1y = p1.y + (p2.y - p0.y) / 6 * tension
    const cp2x = p2.x - (p3.x - p1.x) / 6 * tension
    const cp2y = p2.y - (p3.y - p1.y) / 6 * tension

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return d
}

function smoothPath(points: { x: number; y: number }[], tension = 0.5): string {
  return catmullRom2bezier(points, tension)
}

function useCountUp(target: number, duration = 1200, start = false) {
  const [value, setValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!start) {
      setValue(0)
      return
    }

    const ease = (t: number) => {
      const x = Math.min(1, Math.max(0, t))
      return 1 - Math.pow(1 - x, 3)
    }

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(1, elapsed / duration)
      setValue(Math.round(target * ease(progress)))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, start])

  return value
}

function useInViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

const CHART_PADDING = { top: 24, right: 48, bottom: 32, left: 48 }
const CHART_HEIGHT = 280
const CHART_WIDTH = 760

function MiniSparkline({
  data,
  maxY,
  hoverIndex,
  width = 60,
  height = 20,
}: {
  data: InsightsDataPoint[]
  maxY: number
  hoverIndex: number
  width?: number
  height?: number
}) {
  const innerWidth = width - 4
  const innerHeight = height - 4
  const count = 7
  const half = Math.floor(count / 2)
  const start = Math.max(0, hoverIndex - half)
  const end = Math.min(data.length - 1, start + count - 1)
  const sliceStart = Math.max(0, end - count + 1)
  const slice = data.slice(sliceStart, sliceStart + count)
  const localHover = hoverIndex - sliceStart

  const points = slice.map((d, i) => ({
    x: 2 + (i / Math.max(1, slice.length - 1)) * innerWidth,
    visitorsY: 2 + innerHeight - (d.visitors / maxY) * innerHeight,
    sessionsY: 2 + innerHeight - (d.sessions / maxY) * innerHeight,
  }))

  const visitorsPath = smoothPath(points.map((p) => ({ x: p.x, y: p.visitorsY })), 0.4)
  const sessionsPath = smoothPath(points.map((p) => ({ x: p.x, y: p.sessionsY })), 0.4)
  const hoveredPoint = points[localHover]

  return (
    <svg width={width} height={height} className="insights-chart__sparkline">
      <path d={visitorsPath} className="insights-chart__sparkline-line insights-chart__sparkline-line--visitors" />
      <path d={sessionsPath} className="insights-chart__sparkline-line insights-chart__sparkline-line--sessions" />
      {hoveredPoint && (
        <circle
          cx={hoveredPoint.x}
          cy={hoveredPoint.visitorsY}
          r={2}
          className="insights-chart__sparkline-dot"
        />
      )}
    </svg>
  )
}

export function InsightsChart({
  title,
  dateRangeLabel: dateRangeLabelProp,
  data: dataProp,
  figLabel,
  onToggleMock,
  mockActive,
}: InsightsChartProps) {
  const data = useMemo(() => dataProp && dataProp.length > 0 ? dataProp : generateMockInsightsData(), [dataProp])
  const dateRangeLabel = useMemo(() => {
    if (dateRangeLabelProp) return dateRangeLabelProp
    return `(${formatShortDate(data[0].date)} – ${formatShortDate(data[data.length - 1].date)})`
  }, [dateRangeLabelProp, data])

  const { ref: sectionRef, visible: inView } = useInViewport<HTMLDivElement>()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [hoverHistory, setHoverHistory] = useState<number[]>([])

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingHoverIndex = useRef<number | null>(null)

  const totals = useMemo(() => {
    const visitors = data.reduce((s, d) => s + d.visitors, 0)
    const sessions = data.reduce((s, d) => s + d.sessions, 0)
    const views = Math.round(sessions * (6 + ((visitors % 7) / 10)))
    return { visitors, sessions, views }
  }, [data])

  const visitorsCount = useCountUp(totals.visitors, 1200, inView)
  const sessionsCount = useCountUp(totals.sessions, 1200, inView)
  const viewsCount = useCountUp(totals.views, 1200, inView)

  const maxY = useMemo(() => {
    const max = Math.max(...data.map((d) => Math.max(d.visitors, d.sessions)))
    return Math.ceil(max / 50) * 50 || 100
  }, [data])

  const points = useMemo(() => {
    const innerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right
    const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

    return data.map((d, i) => {
      const x = CHART_PADDING.left + (i / (data.length - 1)) * innerWidth
      return {
        x,
        visitorsY: CHART_PADDING.top + innerHeight - (d.visitors / maxY) * innerHeight,
        sessionsY: CHART_PADDING.top + innerHeight - (d.sessions / maxY) * innerHeight,
      }
    })
  }, [data, maxY])

  const visitorsPath = useMemo(() => {
    return smoothPath(points.map((p) => ({ x: p.x, y: p.visitorsY })), 0.5)
  }, [points])

  const sessionsPath = useMemo(() => {
    return smoothPath(points.map((p) => ({ x: p.x, y: p.sessionsY })), 0.5)
  }, [points])

  const gridLines = useMemo(() => {
    const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom
    return [0, 0.25, 0.5, 0.75, 1].map((t) => CHART_PADDING.top + innerHeight * t)
  }, [])

  const verticalGridLines = useMemo(() => {
    const innerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right
    const count = 6
    return Array.from({ length: count + 1 }, (_, i) => CHART_PADDING.left + (i / count) * innerWidth)
  }, [])

  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

  useEffect(() => {
    if (hoverIndex === null) {
      if (!isHovering) setHoverHistory([])
      return
    }
    setHoverHistory((prev) => [hoverIndex, ...prev].slice(0, 5))
  }, [hoverIndex, isHovering])

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (CHART_WIDTH / rect.width)
    const innerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right
    const ratio = Math.min(1, Math.max(0, (x - CHART_PADDING.left) / innerWidth))
    const index = Math.round(ratio * (data.length - 1))

    pendingHoverIndex.current = index
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      if (pendingHoverIndex.current !== null) {
        setHoverIndex(pendingHoverIndex.current)
      }
      debounceTimer.current = null
    }, 16)

    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
      debounceTimer.current = null
    }
    pendingHoverIndex.current = null
    setIsHovering(false)
    setHoverIndex(null)
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null
  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null
  const hoverLeftPct = hoveredPoint ? (hoveredPoint.x / CHART_WIDTH) * 100 : 0
  const hoverTopPct = hoveredPoint
    ? (Math.min(hoveredPoint.visitorsY, hoveredPoint.sessionsY) / CHART_HEIGHT) * 100
    : 0
  const hoverNearRight = hoveredPoint ? hoveredPoint.x > CHART_WIDTH * 0.65 : false

  const closestGridIndex = useMemo(() => {
    if (!hoveredPoint) return -1
    return gridLines.reduce((closest, y, i) => {
      return Math.abs(y - hoveredPoint.visitorsY) < Math.abs(gridLines[closest] - hoveredPoint.visitorsY) ? i : closest
    }, 0)
  }, [hoveredPoint, gridLines])

  const displayStats = useMemo(() => {
    if (hoverIndex === null || !isHovering) return totals
    const d = data[hoverIndex]
    return {
      visitors: d.visitors,
      sessions: d.sessions,
      views: Math.round(d.sessions * 6.5),
    }
  }, [hoverIndex, isHovering, data, totals])

  const delta = useMemo(() => {
    if (hoverIndex === null || hoverIndex === 0 || !isHovering) return null
    const curr = data[hoverIndex]
    const prev = data[hoverIndex - 1]
    return {
      visitors: curr.visitors - prev.visitors,
      sessions: curr.sessions - prev.sessions,
    }
  }, [hoverIndex, isHovering, data])

  const tooltipSparklineMaxY = useMemo(() => {
    const half = 3
    const start = Math.max(0, (hoverIndex ?? 0) - half)
    const end = Math.min(data.length - 1, start + 6)
    const slice = data.slice(start, end + 1)
    const max = Math.max(...slice.map((d) => Math.max(d.visitors, d.sessions)))
    return Math.ceil(max / 20) * 20 || 100
  }, [hoverIndex, data])

  return (
    <div ref={sectionRef} className="insights-chart" data-cursor-crosshair={isHovering || undefined}>
      {figLabel && <span className="insights-chart__fig">{figLabel}</span>}
      {onToggleMock && (
        <button
          type="button"
          onClick={onToggleMock}
          className="insights-mock-toggle"
        >
          {mockActive ? 'Show live data' : 'Preview mock data'}
        </button>
      )}

      {(title || dateRangeLabel) && (
        <>
          <div className="insights-chart__header">
            {title && <h2 className="insights-chart__title">{title}</h2>}
            {dateRangeLabel && <span className="insights-chart__range">{dateRangeLabel}</span>}
          </div>
          <div className="insights-chart__divider" />
        </>
      )}

      <div className={`insights-chart__stats ${isHovering ? 'insights-chart__stats--live' : ''}`}>
        <div className="insights-chart__stat">
          <span className="insights-chart__stat-label">
            {isHovering ? 'Visitors that day' : 'Unique Visitors'}
          </span>
          <span className="insights-chart__stat-value" key={`visitors-${isHovering ? hoverIndex : 'total'}`}>
            {formatNumber(displayStats.visitors)}
          </span>
        </div>
        <div className="insights-chart__stat">
          <span className="insights-chart__stat-label">
            {isHovering ? 'Sessions that day' : 'Sessions'}
          </span>
          <span className="insights-chart__stat-value" key={`sessions-${isHovering ? hoverIndex : 'total'}`}>
            {formatNumber(displayStats.sessions)}
          </span>
        </div>
        <div className="insights-chart__stat">
          <span className="insights-chart__stat-label">
            {isHovering ? 'Views that day' : 'Views'}
          </span>
          <span className="insights-chart__stat-value" key={`views-${isHovering ? hoverIndex : 'total'}`}>
            {formatNumber(displayStats.views)}
          </span>
        </div>
      </div>

      <div className="insights-chart__divider" />

      <div className="insights-chart__chart">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="insights-chart__svg"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="cursor-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--accent)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridLines.map((y, i) => (
            <line
              key={`h-${i}`}
              x1={CHART_PADDING.left}
              y1={y}
              x2={CHART_WIDTH - CHART_PADDING.right}
              y2={y}
              className={`insights-chart__gridline ${i === closestGridIndex && isHovering ? 'insights-chart__gridline--active' : ''} ${isHovering ? 'insights-chart__gridline--dimmed' : ''}`}
            />
          ))}
          {verticalGridLines.map((x, i) => (
            <line
              key={`v-${i}`}
              x1={x}
              y1={CHART_PADDING.top}
              x2={x}
              y2={CHART_HEIGHT - CHART_PADDING.bottom}
              className="insights-chart__gridline insights-chart__gridline--vertical"
            />
          ))}

          {hoveredPoint && (
            <>
              <rect
                x={CHART_PADDING.left}
                y={CHART_PADDING.top}
                width={hoveredPoint.x - CHART_PADDING.left}
                height={innerHeight}
                className={`insights-chart__dim insights-chart__dim--left ${isHovering ? 'insights-chart__dim--active' : ''}`}
              />
              <rect
                x={hoveredPoint.x}
                y={CHART_PADDING.top}
                width={CHART_WIDTH - CHART_PADDING.right - hoveredPoint.x}
                height={innerHeight}
                className={`insights-chart__dim insights-chart__dim--right ${isHovering ? 'insights-chart__dim--active' : ''}`}
              />
            </>
          )}

          <path
            d={sessionsPath}
            className="insights-chart__line insights-chart__line--sessions"
            style={{
              strokeDasharray: inView ? 3000 : 0,
              strokeDashoffset: inView ? 0 : 3000,
            }}
          />
          <path
            d={visitorsPath}
            className="insights-chart__line insights-chart__line--visitors"
            style={{
              strokeDasharray: inView ? 3000 : 0,
              strokeDashoffset: inView ? 0 : 3000,
            }}
          />

          {hoverHistory.map((idx, i) => {
            const p = points[idx]
            if (!p) return null
            const opacities = [0.3, 0.2, 0.12, 0.07, 0.03]
            const radii = [2, 1.7, 1.4, 1.1, 0.8]
            return (
              <circle
                key={`trail-${idx}-${i}`}
                cx={p.x}
                cy={p.visitorsY}
                r={radii[i]}
                className={`insights-chart__ghost ${isHovering ? 'insights-chart__ghost--visible' : ''}`}
                style={{ '--ghost-opacity': opacities[i] } as React.CSSProperties}
              />
            )
          })}

          {hoveredPoint && (
            <g
              className="insights-chart__hover"
              style={{ transform: `translateX(${hoveredPoint.x}px)` }}
            >
              <line
                x1={0}
                y1={CHART_PADDING.top}
                x2={0}
                y2={CHART_HEIGHT - CHART_PADDING.bottom}
                className="insights-chart__cursor-shadow"
              />
              <line
                x1={0}
                y1={CHART_PADDING.top}
                x2={0}
                y2={CHART_HEIGHT - CHART_PADDING.bottom}
                className="insights-chart__cursor-line"
              />

              <circle
                key={`ripple-s-${hoverIndex}`}
                cx={0}
                cy={hoveredPoint.sessionsY}
                r={18}
                className="insights-chart__ripple insights-chart__ripple--sessions"
              />
              <circle
                key={`ripple-v-${hoverIndex}`}
                cx={0}
                cy={hoveredPoint.visitorsY}
                r={18}
                className="insights-chart__ripple insights-chart__ripple--visitors"
              />

              <g className={`insights-chart__dot-group ${isHovering ? 'insights-chart__dot-group--active' : ''}`}>
                <g style={{ transform: `translateY(${hoveredPoint.sessionsY}px)` }}>
                  <circle r={12} className="insights-chart__dot-pulse insights-chart__dot-pulse--sessions" />
                  <circle r={7} className="insights-chart__dot-glow insights-chart__dot-glow--sessions" />
                  <circle
                    key={`core-s-${hoverIndex}`}
                    r={4.5}
                    className="insights-chart__dot-core insights-chart__dot-core--sessions"
                  />
                </g>
                <g style={{ transform: `translateY(${hoveredPoint.visitorsY}px)` }}>
                  <circle r={12} className="insights-chart__dot-pulse insights-chart__dot-pulse--visitors" />
                  <circle r={7} className="insights-chart__dot-glow insights-chart__dot-glow--visitors" />
                  <circle
                    key={`core-v-${hoverIndex}`}
                    r={4.5}
                    className="insights-chart__dot-core insights-chart__dot-core--visitors"
                  />
                </g>
              </g>
            </g>
          )}
        </svg>

        <div
          className={`insights-chart__pill ${hoveredPoint && hovered ? 'insights-chart__pill--visible' : ''}`}
          style={{ left: `${hoverLeftPct}%` }}
        >
          {hovered ? formatDateLabel(hovered.date) : ''}
        </div>
        <div
          className={`insights-chart__tooltip ${hoverNearRight ? 'insights-chart__tooltip--left' : ''} ${hoveredPoint && hovered ? 'insights-chart__tooltip--visible' : ''}`}
          style={{ left: `${hoverLeftPct}%`, top: `${hoverTopPct}%` }}
        >
          <div className="insights-chart__tooltip-date">{hovered ? formatDateLabel(hovered.date) : ''}</div>
          <div className="insights-chart__tooltip-row">
            <span className="insights-chart__tooltip-dot insights-chart__tooltip-dot--visitors" />
            <span className="insights-chart__tooltip-label">Visitors</span>
            <span className="insights-chart__tooltip-value" key={`tt-v-${hoverIndex}`}>
              {hovered ? formatNumber(hovered.visitors) : ''}
            </span>
          </div>
          <div className="insights-chart__tooltip-row">
            <span className="insights-chart__tooltip-dot insights-chart__tooltip-dot--sessions" />
            <span className="insights-chart__tooltip-label">Sessions</span>
            <span className="insights-chart__tooltip-value" key={`tt-s-${hoverIndex}`}>
              {hovered ? formatNumber(hovered.sessions) : ''}
            </span>
          </div>
          {delta && (
            <div className="insights-chart__tooltip-delta">
              <span className={delta.visitors >= 0 ? 'insights-chart__tooltip-delta--positive' : 'insights-chart__tooltip-delta--negative'}>
                {delta.visitors >= 0 ? '+' : ''}{formatNumber(delta.visitors)} visitors
              </span>
              {' · '}
              <span className={delta.sessions >= 0 ? 'insights-chart__tooltip-delta--positive' : 'insights-chart__tooltip-delta--negative'}>
                {delta.sessions >= 0 ? '+' : ''}{formatNumber(delta.sessions)} sessions
              </span>
            </div>
          )}
          {hoverIndex !== null && (
            <div className="insights-chart__tooltip-sparkline">
              <MiniSparkline
                data={data}
                maxY={tooltipSparklineMaxY}
                hoverIndex={hoverIndex}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
