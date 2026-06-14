import { useEffect, useState } from 'react'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function BuildInfo() {
  const [label, setLabel] = useState(() => timeAgo(__BUILD_TIME__))

  useEffect(() => {
    const interval = setInterval(() => setLabel(timeAgo(__BUILD_TIME__)), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <a
      href={`https://github.com/williamcachamwri/pixelp/commit/${__COMMIT_HASH__}`}
      target="_blank"
      rel="noopener noreferrer"
      className="build-info"
      title={`Built at ${__BUILD_TIME__.replace('T', ' ').replace(/\.\d+Z/, ' UTC')}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      built {label} · <code>{__COMMIT_HASH__}</code>
    </a>
  )
}
