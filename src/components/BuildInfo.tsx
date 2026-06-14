import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface CommitInfo {
  sha: string
  date: string
}

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
  const [info, setInfo] = useState<CommitInfo | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchCommit() {
      try {
        const res = await fetch('https://api.github.com/repos/williamcachamwri/wica/commits/main')
        if (!res.ok) return
        const json = await res.json()
        if (mounted && json.sha) {
          setInfo({
            sha: json.sha.slice(0, 7),
            date: json.commit?.committer?.date || json.commit?.author?.date || '',
          })
        }
      } catch {
        // ignore
      }
    }

    fetchCommit()
    const interval = setInterval(fetchCommit, 60000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (!info) return null

  return (
    <Link
      to={`/changelog/${info.sha}`}
      className="build-info"
      title={`Latest commit · ${info.date.replace('T', ' ').replace(/\.\d+Z/, ' UTC')}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      built {timeAgo(info.date)} · <code>{info.sha}</code>
    </Link>
  )
}
