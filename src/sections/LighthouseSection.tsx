import { useEffect, useState } from 'react'
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

function scoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'opacity-50'
  if (score >= 0.9) return 'text-green-600'
  if (score >= 0.5) return 'text-amber-600'
  return 'text-red-600'
}

function scoreBg(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'bg-[var(--border)] opacity-30'
  if (score >= 0.9) return 'bg-green-500'
  if (score >= 0.5) return 'bg-amber-500'
  return 'bg-red-500'
}

function toPercent(score: number | null | undefined): string {
  if (score === null || score === undefined) return '—'
  return `${Math.round(score * 100)}`
}

export function LighthouseSection() {
  const [data, setData] = useState<LighthouseData | FetchError | null>(null)

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
      <section id="lighthouse" className="mb-14">
        <SectionDivider label="Lighthouse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="project-card" style={{ padding: '1.15rem' }}>
              <div className="skeleton-line skeleton-line--title w-24 mb-3" />
              <div className="skeleton-line skeleton-line--value w-16 mb-2" />
              <div className="skeleton-line w-full" />
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="project-card" style={{ padding: '0.75rem 1rem' }}>
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
  const now = new Date()
  const latestFetch = d.fetchTime ? new Date(d.fetchTime) : now

  return (
    <section id="lighthouse" className="mb-14">
      <SectionDivider label="Lighthouse" />

      <div className="grid grid-cols-2 gap-3">
        {cats.map((key) => {
          const score = d.scores[key]
          return (
            <article
              key={key}
              className="project-card"
              style={{ padding: '1.15rem' }}
            >
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-1.5">
                {CATEGORY_LABELS[key]}
              </div>
              <div className={`text-2xl font-bold font-mono tabular-nums ${scoreColor(score)}`}>
                {toPercent(score)}
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className={`h-full rounded-full ${scoreBg(score)}`}
                  style={{ width: score !== null && score !== undefined ? `${score * 100}%` : '0%' }}
                />
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-4 space-y-1.5">
        {METRIC_ORDER.map((key) => {
          const m = d.metrics[key]
          if (!m) return null
          const score = m.score
          return (
            <article
              key={key}
              className="project-card"
              style={{ padding: '0.75rem 1rem' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text)] truncate">
                      {m.title}
                    </span>
                    {m.displayValue && (
                      <span className="text-xs font-mono text-[var(--text-subtle)] shrink-0">
                        {m.displayValue}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${scoreBg(score)}`}
                      style={{ width: score !== null && score !== undefined ? `${score * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <span className={`text-base font-bold font-mono tabular-nums shrink-0 ${scoreColor(score)}`}>
                  {toPercent(score)}
                </span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="text-[10px] font-mono text-[var(--text-subtle)] mt-2 text-right">
        desktop · last checked{' '}
        {latestFetch.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>
    </section>
  )
}
