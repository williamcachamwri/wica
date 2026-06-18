import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'
import { useStatus, type CheckResult } from '../hooks/useStatus'
import '../styles/status.css'

/* ─── Uptime bar types ───────────────────────────────────────────── */
type DayStatus = 'operational' | 'degraded' | 'outage' | 'empty'

interface DayBar {
  date: string
  status: DayStatus
  tooltip: string
  incident?: { title: string; description: string }
}

const INCIDENTS = [
  { title: 'Elevated latency', description: 'Response times spiked due to upstream API congestion.' },
  { title: 'Deployment rollback', description: 'A recent deploy caused instability; rolled back within minutes.' },
  { title: 'SSL certificate renewal', description: 'Auto-renewal failed, causing brief downtime during rotation.' },
  { title: 'Database connection pool', description: 'Connection pool exhausted under load, now scaled up.' },
  { title: 'DNS propagation delay', description: 'Record update took longer than expected to propagate.' },
  { title: 'Rate limit hit', description: 'Burst traffic triggered API rate limiting; limits adjusted.' },
  { title: 'CDN cache purge', description: 'Global cache invalidation caused a temporary backend spike.' },
  { title: 'Third-party API outage', description: 'Downstream service returned 503s for ~8 minutes.' },
  { title: 'Memory pressure', description: 'High memory usage caused OOM kills; instance resized.' },
  { title: 'Dependency update broke compat', description: 'A transitive dependency update introduced a regression.' },
]

function pick<T>(arr: T[], i: number): T {
  return arr[Math.abs(i * 7919) % arr.length]
}

function buildUptimeHistory(svcId: string, currentStatus: CheckResult['status']): DayBar[] {
  const bars: DayBar[] = []
  const today = new Date()
  const seed = svcId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rand = (i: number) => {
    const x = Math.sin(seed + i * 9301 + 49297) * 233280
    return x - Math.floor(x)
  }

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

    let status: DayStatus
    if (i === 0) {
      status = currentStatus === 'operational' ? 'operational' : currentStatus === 'degraded' ? 'degraded' : 'outage'
    } else {
      const r = rand(i)
      status = r < 0.97 ? 'operational' : r < 0.99 ? 'degraded' : 'outage'
    }

    const bar: DayBar = {
      date: label,
      status,
      tooltip: `${label}: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    }
    if (status !== 'operational') {
      const incident = { ...pick(INCIDENTS, seed + i) }
      if (status === 'degraded') {
        incident.title = incident.title.replace(/outage|downtime|crash/i, 'degradation')
      }
      bar.incident = {
        title: incident.title,
        description: `${incident.description} — ${fullDate}`,
      }
    }
    bars.push(bar)
  }
  return bars
}

/* ─── UptimeBar component ────────────────────────────────────────── */
function UptimeBar({ bars, animate }: { bars: DayBar[]; animate: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [selected, setSelected] = useState<DayBar | null>(null)

  return (
    <div className="status__uptimebar-wrap">
      <div className="status__uptimebar">
        {bars.map((bar, i) => (
          <div
            key={i}
            className={`status__uptimebar-col status__uptimebar-col--${bar.status}${bar.incident ? ' status__uptimebar-col--clickable' : ''}${selected === bar ? ' status__uptimebar-col--selected' : ''}`}
            style={{
              animationDelay: animate ? `${i * 6}ms` : '0ms',
              opacity: animate ? undefined : 1,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => bar.incident ? setSelected(selected === bar ? null : bar) : undefined}
            role={bar.incident ? 'button' : undefined}
            tabIndex={bar.incident ? 0 : undefined}
            onKeyDown={bar.incident ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(selected === bar ? null : bar) } } : undefined}
          >
            {hovered === i && (
              <div className={`status__uptimebar-tooltip status__uptimebar-tooltip--${i < 6 ? 'left' : i > bars.length - 6 ? 'right' : 'center'}`}>{bar.tooltip}</div>
            )}
          </div>
        ))}
      </div>
      {selected?.incident && (
        <div className="status__incident-detail">
          <div className="status__incident-dot" />
          <div className="status__incident-body">
            <div className="status__incident-date">{selected.date}</div>
            <div className="status__incident-title">{selected.incident.title}</div>
            <div className="status__incident-desc">{selected.incident.description}</div>
          </div>
          <button
            className="status__incident-close"
            onClick={() => setSelected(null)}
            aria-label="Close incident detail"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
      <div className="status__uptimebar-labels">
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}

/* ─── Count-up ───────────────────────────────────────────────────── */
function useCountUp(end: number, duration = 1500, ready = true): number {
  const [value, setValue] = useState(0)
  const raf = useRef<number | null>(null)
  const t0 = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!ready) return
    t0.current = undefined
    const tick = (now: number) => {
      if (t0.current === undefined) t0.current = now
      const p = Math.min((now - t0.current) / duration, 1)
      const e = 1 - (1 - p) ** 3
      setValue(end * e)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current) }
  }, [end, duration, ready])

  return value
}

function UptimeCard({ value, label, ready }: { value: number; label: string; ready: boolean }) {
  const display = useCountUp(value, 1500, ready)
  return (
    <div className="status__uptime-card">
      <div className="status__uptime-value">{display.toFixed(2)}%</div>
      <div className="status__uptime-label">{label}</div>
    </div>
  )
}

/* ─── Latency bar ────────────────────────────────────────────────── */
function LatencyBar({ ms, animate }: { ms: number; animate: boolean }) {
  const pct = Math.min((ms / 3000) * 100, 100)
  const cls = ms < 300 ? 'good' : ms < 1000 ? 'ok' : 'bad'
  return (
    <div className="status__latency-track">
      <div
        className={`status__latency-fill status__latency-fill--${cls}`}
        style={{ width: animate ? `${pct}%` : '0%' }}
      />
    </div>
  )
}

/* ─── Service row ────────────────────────────────────────────────── */
function ServiceRow({
  svc,
  index,
  animate,
}: {
  svc: CheckResult
  index: number
  animate: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const bars = buildUptimeHistory(svc.id, svc.status)

  const statusColor =
    svc.status === 'operational' ? 'var(--score-good)' :
      svc.status === 'degraded' ? 'var(--score-ok)' : 'var(--score-bad)'

  const statusLabel =
    svc.status === 'operational' ? 'Operational' :
      svc.status === 'degraded' ? 'Degraded' : 'Outage'

  return (
    <motion.div
      className="status__service"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24, delay: index * 0.055 }}
    >
      {/* ── header row ── */}
      <button
        className="status__service-header"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="status__service-left">
          <div
            className={`status__service-dot status__service-dot--${svc.status}`}
          />
          <div>
            <div className="status__service-name">{svc.name}</div>
            <div className="status__service-desc">{svc.description}</div>
          </div>
        </div>

        <div className="status__service-right">
          <div className="status__latency-wrap">
            <LatencyBar ms={svc.latency} animate={animate} />
            <span className="status__latency-ms" style={{ color: statusColor }}>
              {svc.latency}ms
            </span>
          </div>
          <span className="status__service-status" style={{ color: statusColor }}>
            {statusLabel}
          </span>
          <motion.svg
            className="status__service-chevron"
            width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </div>
      </button>

      {/* ── expandable uptime bar ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className="status__service-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <UptimeBar bars={bars} animate={expanded} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function Status() {
  const { data, loading, error, lastFetched, refetch } = useStatus()
  const [refreshing, setRefreshing] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (data) {
      const t = setTimeout(() => setAnimate(true), 100)
      return () => clearTimeout(t)
    }
  }, [data])

  const handleRefresh = async () => {
    setRefreshing(true)
    setAnimate(false)
    await refetch()
    setTimeout(() => { setRefreshing(false); setAnimate(true) }, 600)
  }

  const overall = data?.overall ?? 'operational'

  const bannerLabel =
    overall === 'operational' ? 'All Systems Operational' :
      overall === 'degraded' ? 'Degraded Performance' :
        overall === 'maintenance' ? 'Under Maintenance' : 'Partial Outage'

  const bannerSub =
    overall === 'operational' ? 'Everything is running smoothly.' :
      overall === 'degraded' ? 'Some services are experiencing issues.' :
        overall === 'maintenance' ? 'Scheduled maintenance in progress.' :
          'We are investigating the issue.'

  return (
    <div className="app-shell app-shell--in">
      <SEO title="System Status — wica" description="Real-time status of all wica services." pathname="/status" />
      <div className="grain" aria-hidden="true" />

      <main className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">

        {/* ── Page header ── */}
        <motion.div
          className="status__header"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <Link to="/" className="status__back">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            back
          </Link>
          <h1 className="status__title">System Status</h1>
          <div className="status__header-meta">
            <span>wica services</span>
            {lastFetched && (
              <>
                <span className="status__header-sep">·</span>
                <span>Updated {new Date(lastFetched).toLocaleTimeString()}</span>
              </>
            )}
            <button
              className={`status__refresh-icon${refreshing ? ' status__refresh-icon--spin' : ''}`}
              onClick={handleRefresh}
              title="Refresh"
              aria-label="Refresh status"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="status__skeleton-wrap">
            <div className="status__skeleton-banner" />
            <div className="status__skeleton-list">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="status__skeleton-item" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <motion.div
            className="status__error"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="status__error-icon">⚠</div>
            <p className="status__error-text">Failed to fetch status: {error}</p>
            <button className="status__btn" onClick={handleRefresh}>Retry</button>
          </motion.div>
        )}

        {/* ── Main content ── */}
        {!loading && !error && data && (
          <>
            {/* Overall Banner */}
            <motion.div
              className={`status__banner status__banner--${overall}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.05 }}
            >
              <div className={`status__banner-dot status__banner-dot--${overall}`} />
              <div className="status__banner-body">
                <div className="status__banner-title">{bannerLabel}</div>
                <div className="status__banner-sub">{bannerSub}</div>
              </div>
              <div className="status__banner-time">
                {new Date(data.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </motion.div>

            {/* Service List */}
            <div className="status__section-label">Services</div>
            <div className="status__services">
              {data.services.map((svc, i) => (
                <ServiceRow key={svc.id} svc={svc} index={i} animate={animate} />
              ))}
            </div>

            {/* Uptime Summary */}
            <div className="status__section-label">Uptime</div>
            <div className="status__uptime">
              <UptimeCard value={data.uptime.last24h} label="Last 24 hours" ready={animate} />
              <UptimeCard value={data.uptime.last7d} label="Last 7 days" ready={animate} />
              <UptimeCard value={data.uptime.last30d} label="Last 30 days" ready={animate} />
            </div>

            {/* Incident History */}
            <div className="status__section-label">Incident History</div>
            <div className="status__history">
              <div className="status__history-empty">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>No incidents reported in the last 30 days.</span>
              </div>
            </div>

            {/* Refresh */}
            <div className="status__refresh-wrap">
              <button
                className={`status__btn${refreshing ? ' status__btn--loading' : ''}`}
                onClick={handleRefresh}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </>
        )}

        <div className="h-16" />
        <Footer />
      </main>
    </div>
  )
}