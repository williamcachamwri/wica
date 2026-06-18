import { Link } from 'react-router-dom'
import { useStatus } from '../hooks/useStatus'

export function StatusBadge() {
  const { data, loading } = useStatus()

  const overall = data?.overall ?? 'operational'
  const label = loading ? 'Checking…' : overall === 'operational' ? 'All systems normal' : overall === 'degraded' ? 'Degraded' : overall === 'maintenance' ? 'Maintenance' : 'Partial outage'

  return (
    <Link to="/status" className="status-badge">
      <span className={`status-badge__dot status-badge__dot--${overall}`} />
      <span className="status-badge__label">{label}</span>
    </Link>
  )
}
