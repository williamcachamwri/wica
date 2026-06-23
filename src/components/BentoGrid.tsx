import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AnimatedName } from '../components/AnimatedName'
import { CyclingTypewriter } from '../components/CyclingTypewriter'
import { SpriteWithFirework } from '../components/SpriteWithFirework'
import { sprites } from '../data/sprites'
import { GithubContributions } from '../components/GithubContributions'
import { ProjectCard } from '../components/ProjectCard'
import { projects } from '../data/projects'
import { Insights } from '../sections/Insights'
import { LighthouseSection } from '../sections/LighthouseSection'
import { Memories } from '../sections/Memories'
import { NowPlaying } from '../components/NowPlaying'
import { WorkingHours } from '../sections/WorkingHours'
import '../styles/bento.css'

function BentoCellLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bento-cell__label">
      <span>{children}</span>
    </div>
  )
}

function useCellSpotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      el.style.setProperty('--spotlight-x', `${x}%`)
      el.style.setProperty('--spotlight-y', `${y}%`)
    }

    el.addEventListener('mousemove', handleMove, { passive: true })
    return () => el.removeEventListener('mousemove', handleMove)
  }, [])

  return ref
}

const cellVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      type: 'spring' as const,
      stiffness: 240,
      damping: 22,
    },
  }),
}

function BentoHeroContent() {
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1 text-text">
          {sprites.map(({ id, el, delay }) => (
            <SpriteWithFirework key={id} delay={delay}>
              {el}
            </SpriteWithFirework>
          ))}
        </div>
        <CyclingTypewriter
          phrases={[
            'hello, world',
            'it works on my machine',
            'console.log(🐛)',
            'npm install happiness',
            '404: sleep not found',
            'there is no place like 127.0.0.1',
            'coffee first, code later',
            'undefined is not a function',
            'git commit -m "fix"',
            'i speak fluent regex',
            'hello from the other side... of the stack',
          ]}
          start={true}
        />
      </div>

      <h1 className="name-title name-title--hero text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-[-0.03em] leading-[1.08]">
        <AnimatedName startDelay={0}>Lê Vĩnh Khang</AnimatedName>
      </h1>
      <span className="block mt-1 text-muted text-base">Developer & maker</span>

      <div className="bento-hero__bio mt-3">
        <p>
          Code's my happy place. Somewhere between a frontend engineer and a person who firmly believes semicolons are optional — until they're not.
        </p>
        <p>
          When I'm not wrestling with CSS, you'll find me building tiny web toys, talking to my terminal like it's a Tamagotchi.
        </p>
      </div>

      <div className="bento-hero__links">
        <Link to="/blog" className="subtle-link">blog ›</Link>
        <Link to="/guestbook" className="subtle-link">guestbook ›</Link>
        <Link to="/universe" className="subtle-link">universe ›</Link>
      </div>
    </>
  )
}

export function BentoGrid() {
  const heroRef = useCellSpotlight()
  const nowPlayingRef = useCellSpotlight()
  const workingHoursRef = useCellSpotlight()
  const githubRef = useCellSpotlight()
  const insightsRef = useCellSpotlight()
  const lighthouseRef = useCellSpotlight()
  const memoriesRef = useCellSpotlight()
  const projectRefs = projects.map(() => useCellSpotlight())

  return (
    <div className="bento-grid">
      {/* Hero Card */}
      <motion.div
        ref={heroRef}
        className="bento-cell bento-cell--hero"
        variants={cellVariants}
        custom={0}
        initial="hidden"
        animate="visible"
      >
        <BentoHeroContent />
      </motion.div>

      {/* Now Playing */}
      <motion.div
        ref={nowPlayingRef}
        className="bento-cell bento-cell--nowplaying"
        variants={cellVariants}
        custom={1}
        initial="hidden"
        animate="visible"
      >
        <BentoCellLabel>Now Playing</BentoCellLabel>
        <NowPlaying />
      </motion.div>

      {/* Working Hours */}
      <motion.div
        ref={workingHoursRef}
        className="bento-cell bento-cell--workinghours"
        variants={cellVariants}
        custom={2}
        initial="hidden"
        animate="visible"
      >
        <BentoCellLabel>Working Hours</BentoCellLabel>
        <WorkingHours />
      </motion.div>

      {/* GitHub Activity */}
      <motion.div
        ref={githubRef}
        className="bento-cell bento-cell--github"
        variants={cellVariants}
        custom={3}
        initial="hidden"
        animate="visible"
      >
        <BentoCellLabel>GitHub Activity</BentoCellLabel>
        <GithubContributions />
      </motion.div>

      {/* 3 Project Cards */}
      {projects.map((project, i) => (
        <motion.div
          key={project.title}
          ref={projectRefs[i]}
          className="bento-cell bento-cell--project"
          variants={cellVariants}
          custom={4 + i}
          initial="hidden"
          animate="visible"
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}

      {/* Insights Chart */}
      <motion.div
        ref={insightsRef}
        className="bento-cell bento-cell--insights"
        variants={cellVariants}
        custom={7}
        initial="hidden"
        animate="visible"
      >
        <BentoCellLabel>Analytics</BentoCellLabel>
        <Insights />
      </motion.div>

      {/* Lighthouse */}
      <motion.div
        ref={lighthouseRef}
        className="bento-cell bento-cell--lighthouse"
        variants={cellVariants}
        custom={8}
        initial="hidden"
        animate="visible"
      >
        <BentoCellLabel>Performance</BentoCellLabel>
        <LighthouseSection />
      </motion.div>

      {/* Memories */}
      <motion.div
        ref={memoriesRef}
        className="bento-cell bento-cell--memories"
        variants={cellVariants}
        custom={9}
        initial="hidden"
        animate="visible"
      >
        <BentoCellLabel>Photo desk</BentoCellLabel>
        <Memories />
      </motion.div>
    </div>
  )
}
