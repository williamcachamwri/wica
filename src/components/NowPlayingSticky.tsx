import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface NowPlayingData {
  isPlaying: boolean
  title?: string
  artist?: string
  album?: string
  albumArt?: string | null
  url?: string
}

export function NowPlayingSticky() {
  const [data, setData] = useState<NowPlayingData | null>(null)
  const [error, setError] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    let mounted = true

    async function fetchNowPlaying() {
      try {
        const res = await fetch('/api/now-playing')
        if (!res.ok) return
        const json = await res.json()
        if (mounted) {
          setData(json)
          setError(false)
        }
      } catch {
        if (mounted) setError(true)
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const isNotListening = error || !data || !data.isPlaying

  return (
    <motion.div
      className={`nowplaying-sticky${collapsed ? ' nowplaying-sticky--collapsed' : ''}`}
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.8 }}
    >
      <button
        type="button"
        className="nowplaying-sticky__toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Show Spotify widget' : 'Hide Spotify widget'}
      >
        <motion.svg
          width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <polyline points="9 18 15 12 9 6" />
        </motion.svg>
      </button>

      <div className="nowplaying-sticky__body-wrapper">
        {!isNotListening ? (
          <a
            href={data!.url}
            target="_blank"
            rel="noopener noreferrer"
            className="nowplaying-sticky__body"
          >
            <SpotifyIcon className="nowplaying-sticky__icon" />
            <div className="nowplaying-sticky__info">
              <span className="nowplaying-sticky__track">{data!.title}</span>
              <span className="nowplaying-sticky__artist">{data!.artist}</span>
            </div>
            {data!.albumArt && (
              <img
                src={data!.albumArt}
                alt={`${data!.album} cover`}
                className="nowplaying-sticky__art"
                loading="lazy"
              />
            )}
          </a>
        ) : (
          <div className="nowplaying-sticky__body nowplaying-sticky__body--paused">
            <SpotifyIcon className="nowplaying-sticky__icon" />
            <span className="nowplaying-sticky__text">not listening</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.585 14.423a.623.623 0 01-.857.257c-2.347-1.434-5.305-1.757-8.785-.963a.623.623 0 11-.28-1.214c3.792-.873 7.025-.508 9.665 1.063a.623.623 0 01.257.857zm1.226-2.771a.78.78 0 01-1.073.322c-2.685-1.652-6.783-2.13-9.959-1.166a.78.78 0 11-.452-1.493c3.564-1.079 8.032-.548 11.162 1.274a.78.78 0 01.322 1.073zm.105-2.885c-3.22-1.914-8.536-2.09-11.607-1.156a.935.935 0 11-.54-1.79c3.466-1.047 9.308-.84 12.926 1.324a.935.935 0 11-.936 1.62z" />
    </svg>
  )
}