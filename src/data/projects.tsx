import type { Project } from '../types'

const CheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="3" fill="var(--accent)" />
    <rect x="4" y="7" width="3" height="2" fill="#fff" />
    <rect x="6" y="5" width="2" height="2" fill="#fff" />
    <rect x="8" y="4" width="2" height="2" fill="#fff" />
  </svg>
)

const ReaderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="3" fill="#1a1a1a" />
    <rect x="4" y="4" width="8" height="1" fill="#fff" />
    <rect x="4" y="7" width="6" height="1" fill="#fff" opacity="0.8" />
    <rect x="4" y="10" width="7" height="1" fill="#fff" opacity="0.6" />
  </svg>
)

const CodeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="3" fill="#4B5563" />
    <rect x="5" y="5" width="1" height="6" fill="#fff" />
    <rect x="10" y="5" width="1" height="6" fill="#fff" />
    <rect x="6" y="4" width="1" height="1" fill="#fff" />
    <rect x="9" y="4" width="1" height="1" fill="#fff" />
  </svg>
)

export const projects: Project[] = [
  {
    icon: <CheckIcon />,
    title: 'Tiny Tasks',
    tagline: 'Minimal todo app for anxious planners',
    description: 'A distraction-free task manager that hides everything except the next thing you need to do. Local-first, keyboard-driven, and calming by default.',
    links: [
      { label: 'Live demo', href: '#' },
      { label: 'Case study', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
    tags: ['React', 'IndexedDB'],
  },
  {
    icon: <ReaderIcon />,
    title: 'Quiet Reader',
    tagline: 'RSS reader without the noise',
    description: 'A slow-tech RSS reader with serif typography, offline support, and no unread badges. Designed for intentional reading.',
    links: [
      { label: 'Live demo', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
    tags: ['TypeScript', 'PWA'],
  },
  {
    icon: <CodeIcon />,
    title: 'fmtpkg',
    tagline: 'Tiny CLI to format package.json',
    description: 'An open-source CLI helper that sorts dependencies, scripts, and metadata in package.json with zero configuration.',
    links: [
      { label: 'npm', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
    tags: ['Node.js', 'CLI'],
  },
]
/* 1d2bbf31 */
