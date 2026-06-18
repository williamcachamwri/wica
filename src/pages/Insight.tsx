import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { InsightsChart, InsightsDataPoint, generateMockInsightsData } from '../components/InsightsChart'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'
import '../styles/insights-chart.css'
import '../styles/insight.css'

interface DetailedTimePoint {
  date: string
  pageViews: number
  requests: number
  visitors: number
  bytes: number
  threats: number
}

interface CountryStat {
  name: string
  requests: number
  visitors: number
  bytes: number
}

interface StatusCodeStat {
  code: string
  label: string
  requests: number
}

interface HttpMethodStat {
  method: string
  requests: number
}

interface DetailedData {
  timeSeries: DetailedTimePoint[]
  totals: { pageViews: number; requests: number; visitors: number; bytes: number; threats: number }
  countries: CountryStat[]
  statusCodes: StatusCodeStat[]
  httpMethods: HttpMethodStat[]
  mock: boolean
}

function formatNumber(n: number) {
  return n.toLocaleString('en-US')
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3)
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

function useCountUp(target: number, duration = 1400, start = false) {
  const [value, setValue] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!start) { setValue(0); return }
    const ease = (t: number) => { const x = Math.min(1, Math.max(0, t)); return 1 - Math.pow(1 - x, 3) }
    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(1, elapsed / duration)
      setValue(Math.round(target * ease(progress)))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration, start])
  return value
}

function useCountUpBatch(targets: number[], duration = 1200, start = false): number[] {
  const [values, setValues] = useState<number[]>(() => targets.map(() => 0))
  const targetsKey = targets.join(',')
  const rafRef = useRef<number>()
  const startTime = useRef<number | null>(null)

  useEffect(() => {
    if (!start) { setValues(targets.map(() => 0)); return }
    startTime.current = null
    const ease = (t: number) => { const x = Math.min(1, Math.max(0, t)); return 1 - Math.pow(1 - x, 3) }
    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(1, elapsed / duration)
      setValues(targets.map(t => Math.round(t * ease(progress))))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
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
  return buckets.map((b, i) => ({ day: dayNames[i], avg: Math.round(b.total / Math.max(1, b.count)), count: b.count }))
}

function getMaxCodeClass(code: string): string {
  if (code.startsWith('2')) return 'is-2xx'
  if (code.startsWith('3')) return 'is-3xx'
  if (code.startsWith('4')) return 'is-4xx'
  if (code.startsWith('5')) return 'is-5xx'
  return ''
}

export default function Insight() {
  const [insightsData, setInsightsData] = useState<InsightsDataPoint[] | null>(null)
  const [detailed, setDetailed] = useState<DetailedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [countStarted, setCountStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCountStarted(true), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    fetch('/api/insights')
      .then((res) => res.json())
      .then((json) => setInsightsData(json.data ?? []))
      .catch(() => setInsightsData([]))
  }, [])

  useEffect(() => {
    fetch('/api/insights/detailed')
      .then((res) => res.json())
      .then((json) => setDetailed(json))
      .catch(() => setDetailed(null))
      .finally(() => setLoading(false))
  }, [])

  const chartData = useMemo(() => {
    if (insightsData && insightsData.length > 0) return insightsData
    return generateMockInsightsData()
  }, [insightsData])

  const totals = detailed?.totals ?? { pageViews: 0, requests: 0, visitors: 0, bytes: 0, threats: 0 }
  const days = chartData.length
  const growth = computeGrowth(chartData)
  const peak = getPeakDay(chartData)
  const dayBreakdown = getDayOfWeekBreakdown(chartData)
  const bestDay = dayBreakdown.length > 0 ? [...dayBreakdown].sort((a, b) => b.avg - a.avg)[0] : { day: '', avg: 0, count: 0 }

  const requestsCount = useCountUp(totals.requests, 1400, countStarted)
  const pageViewsCount = useCountUp(totals.pageViews, 1400, countStarted)
  const visitorsCount = useCountUp(totals.visitors, 1400, countStarted)
  const threatsCount = useCountUp(totals.threats, 1400, countStarted)
  const dailyAvgVisitorsCount = useCountUp(totals.visitors > 0 ? Math.round(totals.visitors / days) : 0, 1300, countStarted)
  const dailyAvgPageViewsCount = useCountUp(totals.pageViews > 0 ? Math.round(totals.pageViews / days) : 0, 1300, countStarted)
  const growthCount = useCountUp(Math.abs(growth), 1200, countStarted)
  const peakVisitorsCount = useCountUp(peak.visitors, 1200, countStarted)
  const bestDayAvgCount = useCountUp(bestDay.avg, 1200, countStarted)
  const dayCounts = useCountUpBatch(dayBreakdown.map(d => d.avg), 1000, countStarted)

  const formatDateLabel = (date: string) =>
    date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

  const countries = detailed?.countries ?? []
  const statusCodes = detailed?.statusCodes ?? []
  const httpMethods = detailed?.httpMethods ?? []

  const maxCountryRequests = countries.length > 0 ? Math.max(...countries.map(c => c.requests)) : 1
  const maxStatusRequests = statusCodes.length > 0 ? Math.max(...statusCodes.map(s => s.requests)) : 1
  const maxMethodRequests = httpMethods.length > 0 ? Math.max(...httpMethods.map(m => m.requests)) : 1

  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)

  return (
    <div className="app-shell app-shell--in">
      <SEO title="Analytics" description="Detailed traffic analytics and insights for wica.info." pathname="/insight" />
      <div className="grain" aria-hidden="true" />
      <main id="main" className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-14">
          <Link to="/" className="inline-link text-sm mb-6 inline-block">‹ back home</Link>
          <h1 className="name-title text-[clamp(1.75rem,6vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] mb-2">Analytics</h1>
          <p className="text-muted text-[17px] leading-[1.7] mb-8">Full report of site traffic, trends, and visitor behaviour.</p>

          {!loading && (
            <>
              {/* ── Account Analytics ──────────────────────────────── */}
              <h2 className="insight-section-title">Account Analytics</h2>

              <div className="insight-summary">
                <div className="insight-summary__card">
                  <span className="insight-summary__label">Total Requests</span>
                  <span className="insight-summary__value">{formatNumber(requestsCount)}</span>
                </div>
                <div className="insight-summary__card">
                  <span className="insight-summary__label">Page Views</span>
                  <span className="insight-summary__value">{formatNumber(pageViewsCount)}</span>
                </div>
                <div className="insight-summary__card">
                  <span className="insight-summary__label">Unique Visitors</span>
                  <span className="insight-summary__value">{formatNumber(visitorsCount)}</span>
                </div>
                <div className="insight-summary__card">
                  <span className="insight-summary__label">Bandwidth</span>
                  <span className="insight-summary__value">{formatBytes(totals.bytes)}</span>
                </div>
                <div className="insight-summary__card">
                  <span className="insight-summary__label">Threats Blocked</span>
                  <span className="insight-summary__value insight-summary__value--warn">{formatNumber(threatsCount)}</span>
                </div>
              </div>

              <InsightsChart data={chartData} title="Traffic Overview" figLabel="FIG_001" />

              <div className="insight-analysis">
                <div className="insight-analysis__item">
                  <span className="insight-analysis__label">Growth Trend</span>
                  <span className={`insight-analysis__value ${growth >= 0 ? 'insight-analysis__value--positive' : 'insight-analysis__value--negative'}`}>
                    {growth >= 0 ? '+' : ''}{growthCount}%
                  </span>
                  <span className="insight-analysis__note">Visitors, latter vs former half</span>
                </div>
                <div className="insight-analysis__item">
                  <span className="insight-analysis__label">Daily Avg Visitors</span>
                  <span className="insight-analysis__value">{formatNumber(dailyAvgVisitorsCount)}</span>
                  <span className="insight-analysis__note">{formatNumber(dailyAvgPageViewsCount)} avg page views</span>
                </div>
                <div className="insight-analysis__item">
                  <span className="insight-analysis__label">Peak Day</span>
                  <span className="insight-analysis__value">{formatDateLabel(peak.date)}</span>
                  <span className="insight-analysis__note">{formatNumber(peakVisitorsCount)} visitors</span>
                </div>
              </div>

              {dayBreakdown.length > 0 && (
                <div className="insight-days">
                  <h3 className="insight-days__title">Visitors by Day of Week</h3>
                  <div className="insight-days__grid">
                    {dayBreakdown.map((d, i) => {
                      const pct = bestDay.avg > 0 ? (d.avg / bestDay.avg) * 100 : 0
                      return (
                        <div key={d.day} className="insight-days__bar-group">
                          <span className="insight-days__bar-label">{d.day}</span>
                          <div className="insight-days__bar-track">
                            <div className="insight-days__bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="insight-days__bar-value">{formatNumber(dayCounts[i] ?? 0)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Web Analytics ──────────────────────────────────── */}
              <h2 className="insight-section-title insight-section-title--alt">Web Analytics</h2>

              {countries.length > 0 && (
                <div className="insight-block">
                  <h3 className="insight-block__title">Top Countries</h3>
                  <div className="insight-block__body">
                    {countries.map((c) => {
                      const pct = (c.requests / maxCountryRequests) * 100
                      const isHovered = hoveredCountry === c.name
                      return (
                        <div
                          key={c.name}
                          className="insight-bar-group"
                          onMouseEnter={() => setHoveredCountry(c.name)}
                          onMouseLeave={() => setHoveredCountry(null)}
                          data-hovered={isHovered || undefined}
                        >
                          <span className="insight-bar-group__label">{c.name}</span>
                          <div className="insight-bar-group__track">
                            <div className="insight-bar-group__fill insight-bar-group__fill--country" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="insight-bar-group__value">{formatNumber(c.requests)}</span>
                          <span className="insight-bar-group__sub">{formatNumber(c.visitors)} visitors</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {statusCodes.length > 0 && (
                <div className="insight-block">
                  <h3 className="insight-block__title">Status Codes</h3>
                  <div className="insight-block__body">
                    {statusCodes.map((s) => {
                      const pct = (s.requests / maxStatusRequests) * 100
                      const isHovered = hoveredStatus === s.code
                      return (
                        <div
                          key={s.code}
                          className="insight-bar-group"
                          onMouseEnter={() => setHoveredStatus(s.code)}
                          onMouseLeave={() => setHoveredStatus(null)}
                          data-hovered={isHovered || undefined}
                        >
                          <span className="insight-bar-group__label">
                            <span className={`insight-status-badge ${getMaxCodeClass(s.code)}`}>{s.code}</span>
                            {s.label && <span className="insight-bar-group__sub-label">{s.label}</span>}
                          </span>
                          <div className="insight-bar-group__track">
                            <div className={`insight-bar-group__fill insight-bar-group__fill--${getMaxCodeClass(s.code) || 'default'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="insight-bar-group__value">{formatNumber(s.requests)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {httpMethods.length > 0 && (
                <div className="insight-block">
                  <h3 className="insight-block__title">HTTP Methods</h3>
                  <div className="insight-block__body">
                    {httpMethods.map((m) => {
                      const pct = (m.requests / maxMethodRequests) * 100
                      const isHovered = hoveredMethod === m.method
                      return (
                        <div
                          key={m.method}
                          className="insight-bar-group"
                          onMouseEnter={() => setHoveredMethod(m.method)}
                          onMouseLeave={() => setHoveredMethod(null)}
                          data-hovered={isHovered || undefined}
                        >
                          <span className="insight-bar-group__label">
                            <span className="insight-method-badge">{m.method}</span>
                          </span>
                          <div className="insight-bar-group__track">
                            <div className="insight-bar-group__fill insight-bar-group__fill--method" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="insight-bar-group__value">{formatNumber(m.requests)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
        <Footer />
      </main>
    </div>
  )
}
