import { useEffect, useRef, useState } from 'react'
import type { FireworkParticle } from '../types'

const FIREWORK_COLORS = ['var(--accent)', '#1a1a1a', '#6b7280', '#f59e0b', '#10b981', '#ec4899']

function createParticles(count = 18): FireworkParticle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
    const speed = 40 + Math.random() * 70
    return {
      id: Math.random().toString(36).slice(2),
      color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
      size: 4 + Math.floor(Math.random() * 4),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 20,
      rot: Math.random() * 360,
    }
  })
}

interface SpriteWithFireworkProps {
  children: React.ReactNode
  delay: number
}

export function SpriteWithFirework({ children, delay }: SpriteWithFireworkProps) {
  const [particles, setParticles] = useState<FireworkParticle[]>([])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const explode = () => {
    const newParticles = createParticles()
    setParticles(newParticles)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setParticles([]), 900)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <span
      className="sprite"
      style={{ animationDelay: `${delay}s` }}
      onMouseEnter={explode}
      onClick={explode}
    >
      {children}
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            '--vx': `${p.vx}px`,
            '--vy': `${p.vy}px`,
            '--rot': `${p.rot}deg`,
            '--size': `${p.size}px`,
            '--color': p.color,
          } as React.CSSProperties}
        />
      ))}
    </span>
  )
}
