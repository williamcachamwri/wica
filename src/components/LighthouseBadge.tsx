import { useEffect, useState } from 'react'

interface LighthouseScores {
  performance: number | null
  accessibility: number | null
  bestPractices: number | null
  seo: number | null
}

interface LighthouseData {
  scores: LighthouseScores
  fetchTime?: string
  error?: string
}

const LABELS: Record<keyof LighthouseScores, string> = {
  performance: 'P',
  accessibility: 'A',
  bestPractices: 'BP',
  seo: 'SEO',
}

function toPercent(score: number | null): string {
  if (score === null || score === undefined) return '-'
  return `${Math.round(score * 100)}`
}

function scoreClass(score: number | null): string {
  if (score === null || score === undefined) return 'lighthouse-score--na'
  if (score >= 0.9) return 'lighthouse-score--good'
  if (score >= 0.5) return 'lighthouse-score--avg'
  return 'lighthouse-score--bad'
}

export function LighthouseBadge() {
  const [data, setData] = useState<LighthouseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchScores() {
      try {
        const res = await fetch('/api/lighthouse?url=https://wica.info&strategy=mobile')
        const json = await res.json()
        if (mounted) {
          if (json.scores) {
            setData({ scores: json.scores, fetchTime: json.fetchTime })
          } else if (json.error) {
            setData({ scores: { performance: null, accessibility: null, bestPractices: null, seo: null }, error: json.error })
          }
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchScores()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return <span className="lighthouse-badge lighthouse-badge--loading">lighthouse…</span>
  }

  if (!data) return null

  if ('error' in data && data.error) {
    return (
      <span className="lighthouse-badge lighthouse-badge--loading" title={data.error}>
        lighthouse: setup
      </span>
    )
  }

  return (
    <span
      className="lighthouse-badge"
      title={`Lighthouse scores · ${data.fetchTime ? new Date(data.fetchTime).toLocaleString('en-US') : 'unknown'}`}
    >
      {(Object.keys(data.scores) as Array<keyof LighthouseScores>).map((key) => (
        <span key={key} className={`lighthouse-score ${scoreClass(data.scores[key])}`}>
          <span className="lighthouse-score__label">{LABELS[key]}</span>
          <span className="lighthouse-score__value">{toPercent(data.scores[key])}</span>
        </span>
      ))}
    </span>
  )
}
