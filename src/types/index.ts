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

export interface Team {
  idTeam: string
  name: string
  abbreviation: string
  logo: string
  score: number | null
}

export interface Goal {
  minute: string
  scorer: string
  team: 'home' | 'away'
  assist?: string
  ownGoal?: boolean
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: string
  status: string
  venue: string
  group: string
  stage: string
  matchNumber: number
  minute?: string
  goals?: Goal[]
}

export interface Standing {
  group: string
  teams: {
    rank: number
    name: string
    code: string
    mp: number
    w: number
    d: number
    l: number
    gd: number
    pts: number
    logo: string
  }[]
}

export interface MatchDetails {
  details: any
  timeline: any
  stats: { home: any[]; away: any[] } | null
  playerStats: Record<string, any[]> | null
  powerRanking: any
  matches: Match[]
  standings: Standing[]
}
