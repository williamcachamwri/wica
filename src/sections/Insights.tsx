import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateMockInsightsData, InsightsChart, InsightsDataPoint } from '../components/InsightsChart'
import { SectionDivider } from '../components/SectionDivider'
import '../styles/insights-chart.css'

export function Insights() {
  const navigate = useNavigate()
  const [apiData, setApiData] = useState<InsightsDataPoint[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiMock, setApiMock] = useState(false)
  const [forceMock, setForceMock] = useState(false)
  const [shouldFetch, setShouldFetch] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldFetch(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldFetch) return
    fetch('/api/insights')
      .then((res) => res.json())
      .then((json) => {
        setApiData(json.data ?? [])
        setApiMock(!!json.mock)
      })
      .catch(() => setApiData([]))
      .finally(() => setLoading(false))
  }, [shouldFetch])

  const data = useMemo(() => {
    if (forceMock) return generateMockInsightsData()
    return apiData
  }, [forceMock, apiData])

  if (loading) {
    return (
      <section id="insights" className="mb-14" ref={sectionRef}>
        <SectionDivider label="Analytics" />
        <div className="insights-chart insights-chart--skeleton" aria-hidden="true">
          <div className="insights-chart__header">
            <div className="skeleton-line skeleton-line--title" />
          </div>
          <div className="insights-chart__divider" />
          <div className="insights-chart__stats">
            <div className="insights-chart__stat"><div className="skeleton-line" /><div className="skeleton-line skeleton-line--value" /></div>
            <div className="insights-chart__stat"><div className="skeleton-line" /><div className="skeleton-line skeleton-line--value" /></div>
            <div className="insights-chart__stat"><div className="skeleton-line" /><div className="skeleton-line skeleton-line--value" /></div>
          </div>
          <div className="insights-chart__divider" />
          <div className="insights-chart__chart">
            <div className="skeleton-chart" />
          </div>
        </div>
      </section>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <section id="insights" className="mb-14" ref={sectionRef}>
      <SectionDivider label="Analytics" />
      {apiMock && !forceMock && (
        <p className="text-xs text-[var(--text-subtle)] mb-3">
          Showing demo data. Set <code>CLOUDFLARE_API_TOKEN</code> and <code>CLOUDFLARE_ZONE_ID</code> secrets to fetch real analytics.
        </p>
      )}
      <InsightsChart data={data} figLabel="FIG_001" onToggleMock={() => setForceMock((v) => !v)} mockActive={forceMock} onClick={() => navigate('/insight')} />
    </section>
  )
}
