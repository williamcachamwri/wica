import { useEffect, useState } from 'react'

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function getStatus(h: number): { label: string; color: string } {
  if (h >= 6 && h < 9) return { label: 'Morning 🌅', color: '#f59e0b' }
  if (h >= 9 && h < 12) return { label: 'Working ⚡', color: '#22c55e' }
  if (h >= 12 && h < 14) return { label: 'Lunch 🍜', color: '#f97316' }
  if (h >= 14 && h < 18) return { label: 'Working ⚡', color: '#22c55e' }
  if (h >= 18 && h < 22) return { label: 'Evening 🌙', color: '#8b5cf6' }
  return { label: 'Sleeping 💤', color: '#6366f1' }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WorkingHours() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(id)
  }, [])

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const hours = now.getHours()
  const mins = now.getMinutes()
  const dow = now.getDay()
  const day = now.getDate()
  const month = now.getMonth()
  const status = getStatus(hours)

  return (
    <div className="working-hours">
      <div className="working-hours__row">
        <span className="working-hours__time">
          {pad(hours)}<span className="working-hours__colon">:</span>{pad(mins)}
        </span>
        <span className="working-hours__dot-indicator" style={{ background: status.color }} />
        <span className="working-hours__status" style={{ color: status.color }}>
          {status.label}
        </span>
        <span className="working-hours__sep">/</span>
        <span className="working-hours__tz">{tz}</span>
        <span className="working-hours__date">
          {WEEKDAYS[dow]}, {month + 1}/{day}
        </span>
      </div>
    </div>
  )
}
