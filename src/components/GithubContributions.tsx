import { useEffect, useMemo, useState } from 'react'

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

  if (error) return null
  if (loading || !data) {
    return (
      <div className="github-contributions" aria-busy="true" aria-label="Loading GitHub contributions">
        <div className="contrib-header">
          <div className="contrib-skeleton__title" />
        </div>
        <div className="contrib-grid contrib-grid--skeleton">
          {Array.from({ length: 196 }).map((_, i) => (
            <div key={i} className="contrib-cell contrib-cell--skeleton" />
          ))}
        </div>
        <div className="contrib-footer">
          <div className="contrib-skeleton__text" />
          <div className="contrib-skeleton__legend" />
        </div>
      </div>
    )
  }

  if (data.total === 0 && data.weeks.length === 0) return null

  return (
    <div className="github-contributions">
      <div className="contrib-months" aria-hidden="true">
        {monthLabels.map((m, i) => (
          <span
            key={`${m.label}-${i}`}
            className="contrib-month"
            style={{ gridColumn: m.column + 1 }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="contrib-grid" role="img" aria-label={`GitHub contribution heatmap, ${data.total} contributions in the past year`}>
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
                title={`${day.count} contributions · ${formatDate(day.date)}`}
                style={{ animationDelay: `${weekIndex * 0.012}s` }}
              />
            )
          })
        )}
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
    </div>
  )
}
