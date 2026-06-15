import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const ACCENT_COLORS = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Violet', value: '#7c3aed' },
]

interface FloatingNavbarProps {
  accent: string
  onAccentChange: (color: string) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function FloatingNavbar({ accent, onAccentChange, theme, onToggleTheme }: FloatingNavbarProps) {
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
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: expanded ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <polyline points="18 15 12 9 6 15" />
        </motion.svg>
      </button>

      <div className="floating-navbar__body">
        <div className="floating-navbar__links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>home</Link>
          <Link to="/blog" className={isActive('/blog') ? 'active' : ''}>blog</Link>
          <Link to="/guestbook" className={isActive('/guestbook') ? 'active' : ''}>guestbook</Link>
          <Link to="/universe" className={isActive('/universe') ? 'active' : ''}>universe</Link>
        </div>

        <div className="floating-navbar__palette" aria-label="Accent color">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`color-dot ${accent === color.value ? 'color-dot--active' : ''}`}
              style={{ '--dot-color': color.value } as React.CSSProperties}
              onClick={() => onAccentChange(color.value)}
              title={color.label}
              aria-label={`Use ${color.label} accent`}
            />
          ))}
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
      </div>
    </nav>
  )
}
