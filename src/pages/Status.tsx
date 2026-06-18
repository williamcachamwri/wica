import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { SEO } from '../components/SEO'
import { useStatus } from '../hooks/useStatus'
import '../styles/status.css'

/* ── count-up helpers (local copy) ────────────────────────────── */

function useCountUpValue(end: number, duration = 1500): number {
  const [value, setValue] = useState(0)
  const raf = useRef<number>()
  const startTime = useRef<number>()

  useEffect(() => {
    startTime.current = undefined
    const animate = (now: number) => {
      if (startTime.current === undefined) startTime.current = now
      const elapsed = now - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) * (1 - progress) * (1 - progress)
      setValue(end * eased)
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [end, duration])

  return value
}

function UptimeCard({ value, label }: { value: number; label: string }) {
  const display = useCountUpValue(value)
  return (
    <div className="status__uptime-card">
      <div className="status__uptime-value">{display.toFixed(2)}%</div>
      <div className="status__uptime-label">{label}</div>
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────────── */

export default function Status() {
  const { data, loading, error, lastFetched, refetch } = useStatus()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 600)
  }

  const overall = data?.overall ?? 'operational'
  const bannerDotClass = `status__banner-dot status__banner-dot--${overall}`

  const serviceVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 22, delay: i * 0.06 },
    }),
  }

  return (
    <>
      <SEO title="System Status — wica" description="wica status page" pathname="/status" />

      <div className="status max-w-[680px] mx-auto px-6">
        <div className="status__header">
          <h1 className="status__title">Status</h1>
          <p className="status__subtitle">wica services</p>
        </div>

        {loading ? (
          <>
            <div className="status__skeleton-banner" />
            <div className="status__services">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="status__skeleton-item" />
              ))}
            </div>
          </>
        ) : error ? (
          <div className="status__error">
            <div className="status__error-icon">⚠</div>
            <p className="status__error-text">Failed to fetch status: {error}</p>
            <button className="status__refresh" onClick={handleRefresh}>Retry</button>
          </div>
        ) : data ? (
          <>
            {/* ── Overall Banner ── */}
            <div className="status__banner">
              <div className={bannerDotClass} />
              <div className="status__banner-text">
                <div className="status__banner-status">
                  {overall === 'operational' ? 'All Systems Operational' : overall === 'degraded' ? 'Degraded Performance' : overall === 'maintenance' ? 'Under Maintenance' : 'Partial Outage'}
                </div>
                <div className="status__banner-message">{data.message}</div>
              </div>
              <div className="status__banner-time">
                {new Date(data.checkedAt).toLocaleTimeString()}
              </div>
            </div>

            {/* ── Service List ── */}
            <div className="status__services">
              {data.services.map((svc, i) => {
                const dotClass = `status__service-dot status__service-dot--${svc.status}`
                const statusLabel = svc.status === 'operational' ? 'Operational' : svc.status === 'degraded' ? 'Degraded' : svc.status === 'outage' ? 'Outage' : 'Unknown'
                return (
                  <motion.div
                    key={svc.id}
                    className="status__service"
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={serviceVariants}
                  >
                    <div className={dotClass} />
                    <div className="status__service-info">
                      <div className="status__service-name">{svc.name}</div>
                      <div className="status__service-desc">{svc.description}</div>
                    </div>
                    <div className="status__service-meta">
                      <div className="status__service-status">{statusLabel}</div>
                      <div className="status__service-latency">{svc.latency}ms</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* ── Uptime ── */}
            <div className="status__uptime">
              <UptimeCard value={data.uptime.last24h} label="Last 24 hours" />
              <UptimeCard value={data.uptime.last7d} label="Last 7 days" />
              <UptimeCard value={data.uptime.last30d} label="Last 30 days" />
            </div>

            {/* ── Incident History ── */}
            <div className="status__history">
              <h3 className="status__history-title">Incident History</h3>
              <p className="status__history-empty">No incidents reported</p>
            </div>

            {/* ── Refresh ── */}
            <div className="status__refresh-wrap">
              <button
                className={`status__refresh${refreshing ? ' status__refresh--loading' : ''}`}
                onClick={handleRefresh}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {lastFetched && (
              <p className="status__subtitle" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '11px' }}>
                Last updated {new Date(lastFetched).toLocaleTimeString()}
              </p>
            )}
          </>
        ) : null}
      </div>
    </>
  )
}
