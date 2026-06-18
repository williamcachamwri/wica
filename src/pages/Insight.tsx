import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { InsightsChart, InsightsDataPoint, generateMockInsightsData } from '../components/InsightsChart'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'
import '../styles/insights-chart.css'
import '../styles/insight.css'

function formatNumber(n: number) {
  return n.toLocaleString('en-US')
}

function useCountUp(target: number, duration = 1400, start = false) {
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

function useCountUpBatch(targets: number[], duration = 1200, start = false): number[] {
  const [values, setValues] = useState<number[]>(() => targets.map(() => 0))
  const targetsKey = targets.join(',')
  const rafRef = useRef<number>()
  const startTime = useRef<number | null>(null)

  useEffect(() => {
    if (!start) {
      setValues(targets.map(() => 0))
      return
    }

    startTime.current = null

    const ease = (t: number) => {
      const x = Math.min(1, Math.max(0, t))
      return 1 - Math.pow(1 - x, 3)
    }

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(1, elapsed / duration)
      setValues(targets.map(t => Math.round(t * ease(progress))))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [targetsKey, duration, start])

  return values
}

function computeGrowth(data: InsightsDataPoint[]): number {
  const mid = Math.floor(data.length / 2)
  const first = data.slice(0, mid)
  const second = data.slice(mid)
  const firstAvg = first.reduce((s, d) => s + d.visitors, 0) / first.length
  const secondAvg = second.reduce((s, d) => s + d.visitors, 0) / second.length
  if (firstAvg === 0) return 0
  return Math.round(((secondAvg - firstAvg) / firstAvg) * 100)
}

function getPeakDay(data: InsightsDataPoint[]): { date: string; visitors: number } {
  let peak = data[0]
  for (const d of data) {
    if (d.visitors > peak.visitors) peak = d
  }
  return { date: peak.date, visitors: peak.visitors }
}

type DayStats = { day: string; avg: number; count: number }

function getDayOfWeekBreakdown(data: InsightsDataPoint[]): DayStats[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const buckets: { total: number; count: number }[] = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }))
  for (const d of data) {
    const day = new Date(d.date).getDay()
    buckets[day].total += d.visitors
    buckets[day].count++
  }
  return buckets.map((b, i) => ({
    day: dayNames[i],
    avg: Math.round(b.total / Math.max(1, b.count)),
    count: b.count,
  }))
}

export default function Insight() {
  const [data, setData] = useState<InsightsDataPoint[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [countStarted, setCountStarted] = useState(false)

  useEffect(() => {
    fetch('/api/insights')
      .then((res) => res.json())
      .then((json) => setData(json.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setCountStarted(true), 400)
    return () => clearTimeout(t)
  }, [])

  const displayData = useMemo(() => data && data.length > 0 ? data : generateMockInsightsData(), [data])

  const stats = useMemo(() => {
    if (!displayData) return null
    const totalVisitors = displayData.reduce((s, d) => s + d.visitors, 0)
    const totalSessions = displayData.reduce((s, d) => s + d.sessions, 0)
    const dailyAvgVisitors = Math.round(totalVisitors / displayData.length)
    const dailyAvgSessions = Math.round(totalSessions / displayData.length)
    const growth = computeGrowth(displayData)
    const peak = getPeakDay(displayData)
    const dayBreakdown = getDayOfWeekBreakdown(displayData)
    const bestDay = [...dayBreakdown].sort((a, b) => b.avg - a.avg)[0]
    return { totalVisitors, totalSessions, dailyAvgVisitors, dailyAvgSessions, growth, peak, dayBreakdown, bestDay }
  }, [displayData])

  const totalVisitorsCount = useCountUp(stats?.totalVisitors ?? 0, 1400, countStarted)
  const totalSessionsCount = useCountUp(stats?.totalSessions ?? 0, 1400, countStarted)
  const dailyAvgVisitorsCount = useCountUp(stats?.dailyAvgVisitors ?? 0, 1300, countStarted)
  const dailyAvgSessionsCount = useCountUp(stats?.dailyAvgSessions ?? 0, 1300, countStarted)
  const peakVisitorsCount = useCountUp(stats?.peak.visitors ?? 0, 1200, countStarted)
  const bestDayAvgCount = useCountUp(stats?.bestDay.avg ?? 0, 1200, countStarted)
  const dayCounts = useCountUpBatch(stats?.dayBreakdown.map(d => d.avg) ?? [], 1000, countStarted)

  const formatDateLabel = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="app-shell app-shell--in">
      <SEO
        title="Analytics"
        description="Detailed traffic analytics and insights for wica.info."
        pathname="/insight"
      />
      <div className="grain" aria-hidden="true" />
      <main id="main" className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-14">
          <Link to="/" className="inline-link text-sm mb-6 inline-block">
            ‹ back home
          </Link>
          <h1 className="name-title text-[clamp(1.75rem,6vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-2">
            Analytics
          </h1>
          <p className="text-muted text-[17px] leading-[1.7] mb-8">
            Full report of site traffic, trends, and visitor behaviour.
          </p>

          {stats && (
            <div className="insight-summary">
              <div className="insight-summary__card">
                <span className="insight-summary__label">Total Visitors</span>
                <span className="insight-summary__value">{formatNumber(totalVisitorsCount)}</span>
              </div>
              <div className="insight-summary__card">
                <span className="insight-summary__label">Total Sessions</span>
                <span className="insight-summary__value">{formatNumber(totalSessionsCount)}</span>
              </div>
              <div className="insight-summary__card">
                <span className="insight-summary__label">Daily Avg Visitors</span>
                <span className="insight-summary__value">{formatNumber(dailyAvgVisitorsCount)}</span>
              </div>
              <div className="insight-summary__card">
                <span className="insight-summary__label">Daily Avg Sessions</span>
                <span className="insight-summary__value">{formatNumber(dailyAvgSessionsCount)}</span>
              </div>
            </div>
          )}

          {!loading && displayData && (
            <InsightsChart
              data={displayData}
              title="Traffic Overview"
              figLabel="FIG_001"
            />
          )}

          {stats && (
            <div className="insight-analysis">
              <div className="insight-analysis__item">
                <span className="insight-analysis__label">Growth Trend</span>
                <span className={`insight-analysis__value ${stats.growth >= 0 ? 'insight-analysis__value--positive' : 'insight-analysis__value--negative'}`}>
                  {stats.growth >= 0 ? '+' : ''}{stats.growth}%
                </span>
                <span className="insight-analysis__note">Comparing latter half to former half</span>
              </div>
              <div className="insight-analysis__item">
                <span className="insight-analysis__label">Peak Day</span>
                <span className="insight-analysis__value">{formatDateLabel(stats.peak.date)}</span>
                <span className="insight-analysis__note">{formatNumber(peakVisitorsCount)} visitors</span>
              </div>
              <div className="insight-analysis__item">
                <span className="insight-analysis__label">Best Day of Week</span>
                <span className="insight-analysis__value">{stats.bestDay.day}</span>
                <span className="insight-analysis__note">{formatNumber(bestDayAvgCount)} avg visitors</span>
              </div>
            </div>
          )}

          {stats && (
            <div className="insight-days">
              <h3 className="insight-days__title">Visitors by Day of Week</h3>
              <div className="insight-days__grid">
                {stats.dayBreakdown.map((d, i) => {
                  const pct = stats.totalVisitors > 0 ? ((d.avg / stats.bestDay.avg) * 100) : 0
                  return (
                    <div key={d.day} className="insight-days__bar-group">
                      <span className="insight-days__bar-label">{d.day}</span>
                      <div className="insight-days__bar-track">
                        <div
                          className="insight-days__bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="insight-days__bar-value">{formatNumber(dayCounts[i] ?? 0)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
        <Footer />
      </main>
    </div>
  )
}
