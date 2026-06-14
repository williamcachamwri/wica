import type { ReactNode } from 'react'

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  icon: ReactNode
  title: string
  tagline: string
  description: string
  links: ProjectLink[]
  tags: string[]
}

export interface Photo {
  src: string
  caption: string
  rotate: number
}

export interface SpriteItem {
  id: string
  el: ReactNode
  delay: number
}

export interface FireworkParticle {
  id: string
  color: string
  size: number
  vx: number
  vy: number
  rot: number
}
