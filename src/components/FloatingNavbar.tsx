import { Link, useLocation } from 'react-router-dom'

const ACCENT_COLORS = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Violet', value: '#7c3aed' },
]

interface FloatingNavbarProps {
  inspectActive: boolean
  onToggleInspect: () => void
  accent: string
  onAccentChange: (color: string) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function FloatingNavbar({ inspectActive, onToggleInspect, accent, onAccentChange, theme, onToggleTheme }: FloatingNavbarProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="floating-navbar">
      <div className="floating-navbar__brand">
        <Link to="/">lvk</Link>
      </div>

      <div className="floating-navbar__links">
        <Link to="/" className={isActive('/') ? 'active' : ''}>home</Link>
        <Link to="/blog" className={isActive('/blog') ? 'active' : ''}>blog</Link>
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

      <button
        type="button"
        className={`inspect-toggle ${inspectActive ? 'inspect-toggle--active' : ''}`}
        onClick={onToggleInspect}
        title={inspectActive ? 'Disable inspector' : 'Enable inspector'}
      >
        <span className="inspect-toggle__icon">◈</span>
        <span className="inspect-toggle__label">{inspectActive ? 'inspect on' : 'inspect'}</span>
      </button>
    </nav>
  )
}
