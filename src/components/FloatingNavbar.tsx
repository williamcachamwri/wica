import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface FloatingNavbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  soundMuted?: boolean
  onToggleSound?: () => void
  commandPaletteOpen?: boolean
  onToggleCommandPalette?: () => void
  layoutMode: 'normal' | 'bento'
  onToggleLayout: () => void
}

function BentoGridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="0" y="0" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="8" y="0" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="0" y="8" width="14" height="6" rx="1.5" fill="currentColor"/>
    </svg>
  )
}

function ListViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/>
      <rect x="0" y="6" width="14" height="2" rx="1" fill="currentColor"/>
      <rect x="0" y="11" width="14" height="2" rx="1" fill="currentColor"/>
    </svg>
  )
}

export function FloatingNavbar({ theme, onToggleTheme, soundMuted = true, onToggleSound, onToggleCommandPalette, layoutMode, onToggleLayout }: FloatingNavbarProps) {
  const location = useLocation()
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const isMobile = window.innerWidth <= 640
    setExpanded(!isMobile)
  }, [])

  useEffect(() => {
    const isMobile = window.innerWidth <= 640
    if (isMobile) setExpanded(false)
  }, [location.pathname])

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

      <button
        type="button"
        className={`layout-toggle ${layoutMode === 'bento' ? 'layout-toggle--active' : ''}`}
        onClick={onToggleLayout}
        title={layoutMode === 'normal' ? 'Bento grid view' : 'Normal view'}
        aria-label={layoutMode === 'normal' ? 'Switch to bento grid' : 'Switch to normal view'}
        aria-pressed={layoutMode === 'bento'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={layoutMode}
            initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 20, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={{ display: 'flex' }}
          >
            {layoutMode === 'normal' ? <BentoGridIcon /> : <ListViewIcon />}
          </motion.span>
        </AnimatePresence>
      </button>
    </nav>
  )
}
