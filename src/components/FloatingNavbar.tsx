import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface FloatingNavbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  soundMuted?: boolean
  onToggleSound?: () => void
  commandPaletteOpen?: boolean
  onToggleCommandPalette?: () => void
}

export function FloatingNavbar({ theme, onToggleTheme, soundMuted = true, onToggleSound, onToggleCommandPalette }: FloatingNavbarProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const isMobile = window.innerWidth <= 640
    setExpanded(!isMobile)
  }, [])

  return (
    <nav className={`floating-navbar${expanded ? ' floating-navbar--expanded' : ' floating-navbar--collapsed'}`}>
      <div className="floating-navbar__brand">
        <Link to="/">lvk</Link>
      </div>

      <button
        type="button"
        className="navbar-expand-btn"
        onClick={() => setExpanded((e) => !e)}
        title={expanded ? 'Collapse navbar' : 'Expand navbar'}
        aria-label={expanded ? 'Collapse navbar' : 'Expand navbar'}
      >
        <motion.svg
          className="navbar-expand-btn__chevron"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: expanded ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <polyline points="18 15 12 9 6 15" />
        </motion.svg>
        <svg
          className="navbar-expand-btn__hamburger"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      <div className="floating-navbar__body">
        <div className="floating-navbar__links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>home</Link>
          <Link to="/blog" className={isActive('/blog') ? 'active' : ''}>blog</Link>
          <Link to="/guestbook" className={isActive('/guestbook') ? 'active' : ''}>guestbook</Link>
          <Link to="/universe" className={isActive('/universe') ? 'active' : ''}>universe</Link>
          <Link to="/uses" className={isActive('/uses') ? 'active' : ''}>uses</Link>
        </div>

        <button
          type="button"
          className="navbar-search"
          onClick={onToggleCommandPalette}
          aria-label="Open command palette"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
          <kbd>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
            </svg>
            K
          </kbd>
        </button>

        {onToggleSound && (
          <button
            type="button"
            className={`sound-toggle ${soundMuted ? 'sound-toggle--muted' : ''}`}
            onClick={onToggleSound}
            title={soundMuted ? 'Unmute UI sounds' : 'Mute UI sounds'}
            aria-label={soundMuted ? 'Unmute UI sounds' : 'Mute UI sounds'}
          >
            <span className="sound-toggle__icon">{soundMuted ? '◼' : '◗'}</span>
            <span className="sound-toggle__label">{soundMuted ? 'sound off' : 'sound on'}</span>
          </button>
        )}
      </div>

      <button
        type="button"
        className="theme-toggle"
        onClick={onToggleTheme}
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <span className="theme-toggle__icon">{theme === 'light' ? '☾' : '☼'}</span>
      </button>
    </nav>
  )
}
