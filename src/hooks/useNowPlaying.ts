import { useEffect, useState } from 'react'

interface NowPlayingData {
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumArt?: string | null
  url?: string
}

let cachedData: NowPlayingData | null = null
let cachedError = false
const listeners = new Set<() => void>()
let fetchTimer: ReturnType<typeof setInterval> | null = null
let fetchCount = 0

function notify() {
  listeners.forEach((fn) => fn())
}

async function doFetch() {
  try {
    const res = await fetch('/api/now-playing')
    if (!res.ok) { cachedError = true; notify(); return }
    cachedData = await res.json()
    cachedError = false
    notify()
  } catch {
    cachedError = true
    notify()
  }
}

export function useNowPlaying() {
  const [, rerender] = useState(0)

  useEffect(() => {
    fetchCount++
    const trigger = () => rerender((n) => n + 1)
    listeners.add(trigger)

    if (fetchCount === 1 || !fetchTimer) {
      doFetch()
      fetchTimer = setInterval(doFetch, 30000)
    } else if (cachedData !== null) {
      trigger()
    }

    return () => {
      listeners.delete(trigger)
      fetchCount--
      if (fetchCount === 0 && fetchTimer) {
        clearInterval(fetchTimer)
        fetchTimer = null
      }
    }
  }, [])

  return { data: cachedData, error: cachedError }
}