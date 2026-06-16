import { useEffect, useRef, useState } from 'react'
import { SectionDivider } from '../components/SectionDivider'

interface AuditMetric {
  score: number | null
  displayValue?: string
  title: string
}

interface LighthouseData {
  url: string
  strategy: string
  fetchTime: string
  scores: Record<string, number | null>
  metrics: Record<string, AuditMetric>
}

interface FetchError {
  error?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  performance: 'Performance',
  accessibility: 'Accessibility',
  bestPractices: 'Best Practices',
  seo: 'SEO',
}

const METRIC_ORDER = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
  'interactive',
]

function scoreVar(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'var(--text-subtle)'
  if (score >= 0.9) return 'var(--score-good)'
  if (score >= 0.5) return 'var(--score-ok)'
  return 'var(--score-bad)'
}

function scoreBgVar(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'var(--border)'
  if (score >= 0.9) return 'var(--score-good)'
  if (score >= 0.5) return 'var(--score-ok)'
  return 'var(--score-bad)'
}

function toPercent(score: number | null | undefined): string {
  if (score === null || score === undefined) return '—'
  return `${Math.round(score * 100)}`
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

function useCountUp(target: number, duration = 1200, start = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) {
      setValue(0)
      return
    }

    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    let raf: number
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(1, elapsed / duration)
      setValue(Math.round(target * ease(progress)))

      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      }
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])

  return value
}

function PerformanceIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="var(--accent)" />
      <rect x="7" y="3" width="2" height="2" fill="#fff" />
      <rect x="6" y="5" width="4" height="6" rx="1" fill="#fff" />
      <rect x="5" y="9" width="1" height="2" fill="#fff" />
      <rect x="10" y="9" width="1" height="2" fill="#fff" />
      <rect x="7" y="11" width="2" height="1" fill="#fff" opacity="0.6" />
      <rect x="7" y="12" width="2" height="1" fill="#fff" opacity="0.3" />
    </svg>
  )
}

function AccessibilityIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="#7c3aed" />
      <rect x="7" y="4" width="2" height="2" rx="1" fill="#fff" />
      <rect x="6" y="7" width="4" height="4" rx="1" fill="#fff" />
      <rect x="5" y="8" width="1" height="3" fill="#fff" opacity="0.8" />
      <rect x="10" y="8" width="1" height="3" fill="#fff" opacity="0.8" />
    </svg>
  )
}

function BestPracticesIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="#0891b2" />
      <rect x="5" y="4" width="6" height="7" rx="1" fill="#fff" opacity="0.2" />
      <rect x="6" y="8" width="2" height="1" fill="#fff" />
      <rect x="7" y="7" width="1" height="1" fill="#fff" />
      <rect x="8" y="6" width="3" height="1" fill="#fff" />
    </svg>
  )
}

function SeoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="#16a34a" />
      <rect x="5" y="5" width="5" height="5" rx="2.5" fill="#fff" opacity="0.2" />
      <rect x="10" y="10" width="1" height="1" fill="#fff" />
      <rect x="11" y="11" width="1" height="1" fill="#fff" />
      <rect x="12" y="12" width="1" height="1" fill="#fff" />
    </svg>
  )
}

const CATEGORY_ICONS: Record<string, () => JSX.Element> = {
  performance: PerformanceIcon,
  accessibility: AccessibilityIcon,
  bestPractices: BestPracticesIcon,
  seo: SeoIcon,
}

export function LighthouseSection() {
  const [data, setData] = useState<LighthouseData | FetchError | null>(null)
  const { ref: sectionRef, visible } = useInViewport<HTMLElement>()

  useEffect(() => {
    let cancelled = false
    async function fetchScores() {
      try {
        const res = await fetch('/api/lighthouse?url=https://wica.info&strategy=desktop')
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setData({ error: 'failed to fetch' })
      }
    }
    fetchScores()
    return () => { cancelled = true }
  }, [])

  if (!data) {
    return (
      <section id="lighthouse" className="lighthouse-section" ref={sectionRef}>
        <SectionDivider label="Lighthouse" />
        <div className="lighthouse-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="lighthouse-card lighthouse-card--skeleton">
              <div className="skeleton-line skeleton-line--title w-24 mb-3" />
              <div className="skeleton-line skeleton-line--value w-16 mb-2" />
              <div className="skeleton-line w-full" />
            </div>
          ))}
        </div>
        <div className="lighthouse-metrics">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="lighthouse-metric lighthouse-metric--skeleton">
              <div className="flex items-center gap-3">
                <div className="skeleton-line flex-1" />
                <div className="skeleton-line w-16" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if ('error' in data && data.error) return null

  const d = data as LighthouseData
  const cats = Object.keys(d.scores)
  const latestFetch = d.fetchTime ? new Date(d.fetchTime) : new Date()

  return (
    <section
      id="lighthouse"
      className={`lighthouse-section ${visible ? 'lighthouse-section--visible' : ''}`}
      ref={sectionRef}
    >
      <SectionDivider label="Lighthouse" />

      <div className="lighthouse-grid">
        {cats.map((key, i) => {
          const score = d.scores[key]
          const Icon = CATEGORY_ICONS[key]
          return (
            <ScoreCard
              key={key}
              label={CATEGORY_LABELS[key]}
              score={score}
              icon={<Icon />}
              index={i}
              visible={visible}
            />
          )
        })}
      </div>

      <div className="lighthouse-metrics">
        {METRIC_ORDER.map((key, i) => {
          const m = d.metrics[key]
          if (!m) return null
          return (
            <MetricRow
              key={key}
              title={m.title}
              value={m.displayValue}
              score={m.score}
              index={i}
              visible={visible}
            />
          )
        })}
      </div>

      <div className="lighthouse-meta">
        {d.strategy} · last checked{' '}
        {latestFetch.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>
    </section>
  )
}

function ScoreCard({
  label,
  score,
  icon,
  index,
  visible,
}: {
  label: string
  score: number | null
  icon: React.ReactNode
  index: number
  visible: boolean
}) {
  const animatedScore = useCountUp(score !== null && score !== undefined ? Math.round(score * 100) : 0, 1200, visible)

  return (
    <article
      className="lighthouse-card"
      style={{
        '--lighthouse-delay': `${index * 0.07}s`,
        '--score': score ?? 0,
        '--bar-delay': `${0.2 + index * 0.07}s`,
      } as React.CSSProperties}
    >
      <span className="lighthouse-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="lighthouse-card__label">{label}</div>
      <div
        className="lighthouse-card__score"
        style={{ color: scoreVar(score) }}
      >
        {score !== null && score !== undefined ? animatedScore : '—'}
      </div>
      <div className="lighthouse-card__bar-track">
        <span
          className="lighthouse-card__bar"
          style={{ background: scoreBgVar(score) }}
        />
      </div>
    </article>
  )
}

function MetricRow({
  title,
  value,
  score,
  index,
  visible,
}: {
  title: string
  value?: string
  score: number | null
  index: number
  visible: boolean
}) {
  return (
    <article
      className="lighthouse-metric"
      style={{
        '--lighthouse-delay': `${0.28 + index * 0.05}s`,
        '--score': score ?? 0,
        '--bar-delay': `${0.4 + index * 0.05}s`,
      } as React.CSSProperties}
    >
      <span
        className="lighthouse-metric__dot"
        style={{ background: scoreBgVar(score) }}
        aria-hidden="true"
      />
      <div className="lighthouse-metric__content">
        <div className="lighthouse-metric__top">
          <span className="lighthouse-metric__name">{title}</span>
          {value && <span className="lighthouse-metric__value">{value}</span>}
        </div>
        <div className="lighthouse-metric__bar-track">
          <span
            className="lighthouse-metric__bar"
            style={{ background: scoreBgVar(score) }}
          />
        </div>
      </div>
      <span
        className="lighthouse-metric__score"
        style={{ color: scoreVar(score) }}
      >
        {toPercent(score)}
      </span>
    </article>
  )
}
