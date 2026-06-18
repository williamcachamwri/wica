import { useEffect, useRef, useState } from 'react'

export interface CheckResult {
  id: string
  name: string
  description: string
  status: 'operational' | 'degraded' | 'outage'
  latency: number
  statusCode: number
  checkedAt: string
  error?: string
}

export interface StatusResponse {
  overall: CheckResult['status'] | 'maintenance'
  message: string
  services: CheckResult[]
  uptime: { last24h: number; last7d: number; last30d: number }
  checkedAt: string
  nextCheck: string
}

export function useStatus(pollMs = 60_000) {
  const [data, setData] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: StatusResponse = await res.json()
      setData(json)
      setError(null)
      setLastFetched(Date.now())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    timerRef.current = setInterval(fetchStatus, pollMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [pollMs])

  return { data, loading, error, lastFetched, refetch: fetchStatus }
}
