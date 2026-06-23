import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CustomCursor } from './components/CustomCursor'
import { FloatingNavbar } from './components/FloatingNavbar'
import { ToastContainer } from './components/Toast'
import { initSound, isMuted, toggleMuted, playClick, playSoftClick } from './lib/sound'
import BlogList from './pages/BlogList'
import Home from './pages/Home'
import './styles/base.css'
import './styles/hero.css'
import './styles/navbar.css'
import './styles/nowplaying.css'
import './styles/footer.css'
import './styles/projects.css'
import './styles/garden.css'
import './styles/cursor.css'
import './styles/components.css'
import './styles/inspect.css'
import './styles/command-palette.css'
import './styles/bento.css'

const CommandPalette = lazy(() => import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })))
const FloatingControls = lazy(() => import('./components/FloatingControls').then(m => ({ default: m.FloatingControls })))
const Inspector = lazy(() => import('./components/Inspector').then(m => ({ default: m.Inspector })))
const NowPlayingSticky = lazy(() => import('./components/NowPlayingSticky').then(m => ({ default: m.NowPlayingSticky })))
const WorldCupSticky = lazy(() => import('./components/WorldCupSticky').then(m => ({ default: m.WorldCupSticky })))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Tags = lazy(() => import('./pages/Tags'))
const Guestbook = lazy(() => import('./pages/Guestbook'))
const Universe = lazy(() => import('./pages/Universe'))
const Changelog = lazy(() => import('./pages/Changelog'))
const Uses = lazy(() => import('./pages/Uses'))
const WorldCupMatch = lazy(() => import('./pages/WorldCupMatch'))
const Insight = lazy(() => import('./pages/Insight'))
const Status = lazy(() => import('./pages/Status'))
const NotFound = lazy(() => import('./pages/NotFound'))

const DEFAULT_ACCENT = '#2563eb'
const THEME_KEY = 'ddt-theme'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(THEME_KEY) as Theme | null
  if (saved === 'light' || saved === 'dark') return saved
  return 'light'
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.99,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -12,
    scale: 1.005,
  },
}

const pageTransition = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 26,
  mass: 0.8,
}

function AnimatedRoutes({ layoutMode }: { layoutMode: 'normal' | 'bento' }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="motion-page"
      >
        <Suspense fallback={null}>
          <Routes location={location}>
            <Route path="/" element={<Home layoutMode={layoutMode} />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/tag/:tag" element={<Tags />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/guestbook" element={<Guestbook />} />
            <Route path="/universe" element={<Universe />} />
            <Route path="/changelog/:sha" element={<Changelog />} />
            <Route path="/uses" element={<Uses />} />
            <Route path="/worldcup/:matchId" element={<WorldCupMatch />} />
            <Route path="/insight" element={<Insight />} />
            <Route path="/status" element={<Status />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const [inspectActive, setInspectActive] = useState(false)
  const [navbarVisible, setNavbarVisible] = useState(true)
  const [navbarReady, setNavbarReady] = useState(false)
  const [accent, setAccent] = useState(DEFAULT_ACCENT)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [soundMuted, setSoundMuted] = useState(true)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'normal' | 'bento'>(
    () => (localStorage.getItem('ddt-layout') as 'normal' | 'bento') || 'normal'
  )
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    initSound()
    setSoundMuted(isMuted())
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('ddt-accent')
    const color = saved || DEFAULT_ACCENT
    setAccent(color)
    document.documentElement.style.setProperty('--accent', color)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    const t = setTimeout(() => setNavbarReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((v) => !v)
        return
      }
      if (e.key === 'Escape') {
        setInspectActive(false)
        setCommandPaletteOpen(false)
      }
      if (e.key === 'ArrowUp') {
        setNavbarVisible(false)
      }
      if (e.key === 'ArrowDown') {
        setNavbarVisible(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isLink = target.closest('a, button, [role="button"], [data-cursor-hover]')
      if (!isLink) return
      playClick()
    }

    window.addEventListener('click', handleClick, { passive: true })
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const handleAccentChange = (color: string) => {
    playSoftClick()
    setAccent(color)
    document.documentElement.style.setProperty('--accent', color)
    localStorage.setItem('ddt-accent', color)
  }

  const handleToggleSound = () => {
    const next = toggleMuted()
    setSoundMuted(!next)
    playSoftClick()
  }

  const toggleLayout = () => {
    playSoftClick()
    setLayoutMode(prev => {
      const next = prev === 'normal' ? 'bento' : 'normal'
      localStorage.setItem('ddt-layout', next)
      return next
    })
  }

  const toggleTheme = () => {
    playSoftClick()
    const next = theme === 'light' ? 'dark' : 'light'

    const btn = document.querySelector('.theme-toggle')
    const rect = btn?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const oldBg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()

    document.documentElement.style.setProperty('--ripple-bg', oldBg)
    document.documentElement.style.setProperty('--ripple-x', `${x}px`)
    document.documentElement.style.setProperty('--ripple-y', `${y}px`)
    document.documentElement.style.setProperty('--ripple-r', `${maxR}px`)

    document.documentElement.classList.remove('theme-transitioning')
    void document.documentElement.offsetWidth
    document.documentElement.classList.add('theme-transitioning')

    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, next)
    setTheme(next)

    if (transitionTimer.current) clearTimeout(transitionTimer.current)
    transitionTimer.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
      transitionTimer.current = null
    }, 900)
  }

  return (
    <BrowserRouter>
      <motion.div
        className="navbar-wrapper"
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: navbarReady && navbarVisible ? 1 : 0,
          y: navbarReady && navbarVisible ? 0 : -20,
          pointerEvents: navbarReady && navbarVisible ? 'auto' : 'none',
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <FloatingNavbar
          theme={theme}
          onToggleTheme={toggleTheme}
          soundMuted={soundMuted}
          onToggleSound={handleToggleSound}
          commandPaletteOpen={commandPaletteOpen}
          onToggleCommandPalette={() => setCommandPaletteOpen((v) => !v)}
          layoutMode={layoutMode}
          onToggleLayout={toggleLayout}
        />
      </motion.div>

      <CustomCursor />
      <Suspense fallback={null}>
        <Inspector active={inspectActive} />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingControls active={inspectActive} onToggle={() => setInspectActive((v) => !v)} accent={accent} onAccentChange={handleAccentChange} />
      </Suspense>
      <Suspense fallback={null}>
        <WorldCupSticky />
      </Suspense>
      <Suspense fallback={null}>
        <NowPlayingSticky />
      </Suspense>
      <AnimatedRoutes layoutMode={layoutMode} />
      <ToastContainer />
      {commandPaletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            open={commandPaletteOpen}
            onOpenChange={setCommandPaletteOpen}
            theme={theme}
            onToggleTheme={toggleTheme}
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
          />
        </Suspense>
      )}
    </BrowserRouter>
  )
}
