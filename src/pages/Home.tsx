import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BentoGrid } from '../components/BentoGrid'
import { Footer } from '../components/Footer'
import { Loader } from '../components/Loader'
import { SEO } from '../components/SEO'
import { GithubActivity } from '../sections/GithubActivity'
import { Hero } from '../sections/Hero'
import { Insights } from '../sections/Insights'
import { LighthouseSection } from '../sections/LighthouseSection'
import { Memories } from '../sections/Memories'
import { Projects } from '../sections/Projects'
import { WorldCup } from '../sections/WorldCup'

const LOADER_SHOWN_KEY = 'ddt-loader-shown'

const layoutVariants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.01,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

interface HomeProps {
  layoutMode: 'normal' | 'bento'
}

export default function Home({ layoutMode }: HomeProps) {
  const alreadyShown = sessionStorage.getItem(LOADER_SHOWN_KEY) === 'true'
  const [loading, setLoading] = useState(!alreadyShown)
  const [loaded, setLoaded] = useState(alreadyShown)

  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem(LOADER_SHOWN_KEY, 'true')
      const t = setTimeout(() => setLoaded(true), 50)
      return () => clearTimeout(t)
    }
  }, [loading])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [layoutMode])

  return (
    <>
      <SEO pathname="/" />
      {loading && <Loader onDone={() => setLoading(false)} />}

      <div className={`app-shell ${loaded ? 'app-shell--in' : 'app-shell--out'}`}>
        <div className="grain" aria-hidden="true" />

        <a href="#main" className="skip-link">
          Skip to content
        </a>

        <AnimatePresence mode="wait" initial={false}>
          {layoutMode === 'normal' ? (
            <motion.main
              key="normal"
              id="main"
              className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={layoutVariants}
            >
              <Hero typewriterStart={!loading} nameStartDelay={1.5} />
              <GithubActivity />
              <WorldCup />
              <Projects />
              <Insights />
              <LighthouseSection />
              <Memories />
              <Footer />
            </motion.main>
          ) : (
            <motion.main
              key="bento"
              id="main"
              className="layout-bento"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={layoutVariants}
            >
              <BentoGrid />
              <Footer />
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
