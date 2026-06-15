import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

interface Day {
  date: string
  count: number
  weekday: number
}

interface Week {
  days: Day[]
}

interface ContributionsData {
  total: number
  weeks: Week[]
}

interface TooltipState {
  x: number
  y: number
  text: string
  visible: boolean
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getLevel(count: number, max: number): number {
  if (count === 0) return 0
  if (max === 0) return 1
  const thresholds = [max * 0.25, max * 0.5, max * 0.75]
  if (count <= thresholds[0]) return 1
  if (count <= thresholds[1]) return 2
  if (count <= thresholds[2]) return 3
  return 4
}

function getMonthLabels(weeks: Week[]): { label: string; column: number }[] {
  const labels: { label: string; column: number }[] = []
  let lastMonth = -1

  weeks.forEach((week, column) => {
    const firstDay = week.days.find((d) => d.count >= 0)
    if (!firstDay) return
    const month = new Date(firstDay.date).getMonth()
    if (month !== lastMonth) {
      labels.push({ label: MONTHS[month], column })
      lastMonth = month
    }
  })

  return labels
}

export function GithubContributions() {
  const [data, setData] = useState<ContributionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, text: '', visible: false })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let mounted = true

    async function fetchContributions() {
      try {
        const res = await fetch('/api/github-contributions')
        if (!res.ok) throw new Error()
        const json = (await res.json()) as ContributionsData
        if (!mounted) return
        setData(json)
        setError(false)
      } catch {
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchContributions()
    return () => { mounted = false }
  }, [])

  const maxCount = useMemo(() => {
    if (!data) return 0
    let max = 0
    data.weeks.forEach((week) => {
      week.days.forEach((day) => {
        if (day.count > max) max = day.count
      })
    })
    return max
  }, [data])

  const monthLabels = useMemo(() => {
    if (!data) return []
    return getMonthLabels(data.weeks)
  }, [data])

  const handleMouseEnter = (e: React.MouseEvent, day: Day) => {
    setTooltip({
      x: e.clientX,
      y: e.clientY - 8,
      text: `${day.count} contributions · ${formatDate(day.date)} · ${WEEKDAYS[day.weekday]}`,
      visible: true,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY - 8 }))
  }

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }))
  }

  if (error) return null
  if (loading || !data) {
    return (
      <div className="github-contributions" aria-busy="true" aria-label="Loading GitHub contributions">
        <div className="contrib-scroll">
          <div className="contrib-grid contrib-grid--skeleton">
            {Array.from({ length: 371 }).map((_, i) => (
              <div key={i} className="contrib-cell contrib-cell--skeleton" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (data.total === 0 && data.weeks.length === 0) return null

  return (
    <div className="github-contributions">
      <div className="contrib-scroll">
        <div
          className="contrib-grid"
          role="img"
          aria-label={`GitHub contribution heatmap, ${data.total} contributions in the past year`}
          style={{ gridTemplateColumns: `repeat(${data.weeks.length + 1}, 9px)` }}
        >
        {monthLabels.map((m, i) => (
          <span
            key={`${m.label}-${i}`}
            className="contrib-month"
            style={{ gridColumn: m.column + 2, gridRow: 1 }}
          >
            {m.label}
          </span>
        ))}

        {data.weeks.map((week, weekIndex) =>
          WEEKDAYS.map((_, weekday) => {
            const day = week.days.find((d) => d.weekday === weekday)
            if (!day) return null
            const level = getLevel(day.count, maxCount)
            return (
                <div
                  key={`${weekIndex}-${weekday}`}
                  className="contrib-cell"
                  data-level={level}
                  title={`${day.count} contributions · ${formatDate(day.date)} · ${WEEKDAYS[day.weekday]}`}
                  style={{
                    gridColumn: weekIndex + 2,
                    gridRow: weekday + 2,
                    animationDelay: `${weekIndex * 0.012}s`,
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, day)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
            )
          })
        )}
        </div>
      </div>

      <div className="contrib-footer">
        <span className="contrib-total">
          {data.total} contributions in the past 365 days
        </span>
        <div className="contrib-legend">
          <span>Less</span>
          <div className="contrib-legend__cells">
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className="contrib-cell" data-level={level} aria-hidden="true" />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {mounted && tooltip.visible && createPortal(
        <div
          className="contrib-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>,
        document.body
      )}
    </div>
  )
}
