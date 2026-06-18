import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface CommandItem {
  id: string
  label: string
  description?: string
  shortcut?: string
  group: 'navigation' | 'actions'
  icon: React.ReactNode
  action: () => void
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function BlogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function GuestbookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function UsesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function UniverseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
    </svg>
  )
}

function ChangelogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ThemeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function SoundIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="command-palette__match">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  soundMuted: boolean
  onToggleSound: () => void
}

export function CommandPalette({ open, onOpenChange, theme, onToggleTheme, soundMuted, onToggleSound }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const close = useCallback(() => {
    onOpenChange(false)
    setQuery('')
    setSelectedIndex(0)
  }, [onOpenChange])

  const run = useCallback((action: () => void) => {
    action()
    close()
  }, [close])

  const items: CommandItem[] = [
    { id: 'home', label: 'Home', description: 'Go to homepage', group: 'navigation', icon: <HomeIcon />, action: () => run(() => navigate('/')) },
    { id: 'blog', label: 'Blog', description: 'Read notes and essays', group: 'navigation', icon: <BlogIcon />, action: () => run(() => navigate('/blog')) },
    { id: 'guestbook', label: 'Guestbook', description: 'Leave a message', group: 'navigation', icon: <GuestbookIcon />, action: () => run(() => navigate('/guestbook')) },
    { id: 'uses', label: 'Uses', description: 'Tools and gear', group: 'navigation', icon: <UsesIcon />, action: () => run(() => navigate('/uses')) },
    { id: 'universe', label: 'Universe', description: 'Black hole canvas', group: 'navigation', icon: <UniverseIcon />, action: () => run(() => navigate('/universe')) },
    { id: 'changelog', label: 'Changelog', description: 'Latest commit', group: 'navigation', icon: <ChangelogIcon />, action: () => run(() => navigate('/changelog/7e86da3')) },
    { id: 'theme', label: `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`, description: 'Toggle color scheme', group: 'actions', icon: <ThemeIcon />, action: () => run(onToggleTheme) },
    { id: 'sound', label: soundMuted ? 'Unmute sound' : 'Mute sound', description: 'Toggle UI sounds', group: 'actions', icon: <SoundIcon muted={soundMuted} />, action: () => run(onToggleSound) },
    { id: 'copy', label: 'Copy link', description: 'Copy current URL', group: 'actions', icon: <CopyIcon />, action: () => run(() => navigator.clipboard.writeText(window.location.href)) },
  ]

  const filtered = query.trim() === ''
    ? items
    : items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
      )

  const groups = [
    { key: 'navigation', label: 'Navigation', items: filtered.filter(i => i.group === 'navigation') },
    { key: 'actions', label: 'Actions', items: filtered.filter(i => i.group === 'actions') },
  ].filter(g => g.items.length > 0)

  const globalIndex = (() => {
    let idx = 0
    for (const group of groups) {
      for (const item of group.items) {
        if (idx === selectedIndex) return item
        idx++
      }
    }
    return null
  })()

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }

      const totalItems = groups.reduce((s, g) => s + g.items.length, 0)

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % totalItems)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = globalIndex
        if (item) item.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, close, groups, globalIndex])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    close()
  }, [location.pathname, close])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="command-palette__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
        >
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.7 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="command-palette__input-wrapper">
              <SearchIcon />
              <input
                ref={inputRef}
                type="text"
                className="command-palette__input"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                spellCheck={false}
              />
              <kbd className="command-palette__esc">Esc</kbd>
            </div>

            <div className="command-palette__list" role="listbox">
              {groups.length === 0 ? (
                <div className="command-palette__empty">
                  <span className="command-palette__empty-icon">⌕</span>
                  No commands found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {groups.map((group) => (
                    <div key={group.key} className="command-palette__group">
                      {query.trim() === '' && (
                        <div className="command-palette__group-label">{group.label}</div>
                      )}
                      {group.items.map((item) => {
                        const isSelected = item === globalIndex
                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            className={`command-palette__item${isSelected ? ' command-palette__item--selected' : ''}`}
                            role="option"
                            aria-selected={isSelected}
                            onClick={item.action}
                            onMouseEnter={() => {
                              let idx = 0
                              for (const g of groups) {
                                for (const gi of g.items) {
                                  if (gi === item) { setSelectedIndex(idx); return }
                                  idx++
                                }
                              }
                            }}
                            layout
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8, transition: { duration: 0.1 } }}
                            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <span className="command-palette__icon">{item.icon}</span>
                            <span className="command-palette__label">
                              <span>{highlightMatch(item.label, query)}</span>
                              {item.description && (
                                <span className="command-palette__description">{item.description}</span>
                              )}
                            </span>
                            {item.shortcut && (
                              <span className="command-palette__shortcut">{item.shortcut}</span>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="command-palette__footer">
              <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
              <span><kbd>↵</kbd> to select</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
