import type { ReactNode } from 'react'

const baseProps = {
  width: '20',
  height: '20',
  viewBox: '0 0 16 16',
  shapeRendering: 'crispEdges' as const,
  'aria-hidden': 'true' as const,
}

const HW_BG = '#1a1a1a'
const DEV_BG = '#4B5563'
const DESK_BG = '#78716c'
const DETAIL = '#fff'

function accentBg() {
  return 'var(--accent)'
}

/* ── Hardware ─────────────────────────────────────────────────────── */

const LaptopIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={HW_BG} />
    <rect x="3" y="4" width="10" height="6" rx="1" fill="#374151" />
    <rect x="5" y="11" width="6" height="1" fill={DETAIL} opacity="0.5" />
    <rect x="1" y="12" width="14" height="1" rx="0.5" fill="#4B5563" />
  </svg>
)

const KeyboardIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={HW_BG} />
    <rect x="3" y="5" width="10" height="7" rx="1" fill="#374151" />
    <rect x="4" y="6" width="1" height="1" fill={DETAIL} opacity="0.9" />
    <rect x="6" y="6" width="1" height="1" fill={DETAIL} opacity="0.9" />
    <rect x="8" y="6" width="1" height="1" fill={DETAIL} opacity="0.9" />
    <rect x="10" y="6" width="1" height="1" fill={DETAIL} opacity="0.9" />
    <rect x="4" y="8" width="1" height="1" fill={DETAIL} opacity="0.9" />
    <rect x="6" y="8" width="1" height="1" fill={DETAIL} opacity="0.9" />
    <rect x="8" y="8" width="1" height="1" fill={DETAIL} opacity="0.9" />
    <rect x="10" y="8" width="1" height="1" fill={DETAIL} opacity="0.9" />
    <rect x="5" y="10" width="6" height="1" fill={DETAIL} opacity="0.6" />
  </svg>
)

const MouseIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={HW_BG} />
    <rect x="6" y="4" width="4" height="8" rx="2" fill="#374151" />
    <rect x="7" y="2" width="2" height="2" fill={DETAIL} opacity="0.5" />
    <rect x="7" y="6" width="2" height="1" fill={DETAIL} opacity="0.9" />
  </svg>
)

const MonitorIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={HW_BG} />
    <rect x="3" y="4" width="10" height="6" rx="1" fill="#374151" />
    <rect x="7" y="11" width="2" height="2" fill={DETAIL} opacity="0.5" />
    <rect x="5" y="13" width="6" height="1" rx="0.5" fill="#4B5563" />
  </svg>
)

/* ── Dev tools ────────────────────────────────────────────────────── */

const TerminalIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={DEV_BG} />
    <rect x="3" y="4" width="10" height="8" rx="1" fill="#1f2937" />
    <rect x="4" y="6" width="2" height="1" fill={DETAIL} />
    <rect x="7" y="6" width="4" height="1" fill={DETAIL} opacity="0.6" />
    <rect x="4" y="9" width="6" height="1" fill={DETAIL} opacity="0.4" />
  </svg>
)

const VsCodeIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={DEV_BG} />
    <rect x="4" y="4" width="2" height="1" fill={DETAIL} />
    <rect x="3" y="5" width="1" height="6" fill={DETAIL} />
    <rect x="4" y="11" width="2" height="1" fill={DETAIL} />
    <rect x="6" y="6" width="1" height="4" fill={DETAIL} opacity="0.5" />
    <rect x="10" y="4" width="2" height="1" fill={DETAIL} />
    <rect x="12" y="5" width="1" height="6" fill={DETAIL} />
    <rect x="10" y="11" width="2" height="1" fill={DETAIL} />
  </svg>
)

const ViteIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={DEV_BG} />
    <rect x="7" y="4" width="2" height="2" fill={DETAIL} />
    <rect x="6" y="6" width="2" height="2" fill={DETAIL} />
    <rect x="8" y="8" width="2" height="2" fill={DETAIL} />
    <rect x="7" y="10" width="2" height="2" fill={DETAIL} />
  </svg>
)

const CloudflareIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={DEV_BG} />
    <rect x="4" y="7" width="8" height="3" rx="1" fill={DETAIL} />
    <rect x="5" y="5" width="4" height="3" rx="1" fill={DETAIL} />
    <rect x="8" y="6" width="3" height="2" rx="1" fill={DETAIL} />
  </svg>
)

/* ── Productivity ─────────────────────────────────────────────────── */

const NotionIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={accentBg()} />
    <rect x="5" y="4" width="2" height="8" fill={DETAIL} />
    <rect x="5" y="4" width="5" height="2" fill={DETAIL} />
    <rect x="8" y="4" width="2" height="8" fill={DETAIL} />
  </svg>
)

const ObsidianIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={accentBg()} />
    <rect x="7" y="4" width="2" height="1" fill={DETAIL} />
    <rect x="6" y="5" width="4" height="1" fill={DETAIL} />
    <rect x="5" y="6" width="6" height="2" fill={DETAIL} />
    <rect x="6" y="8" width="4" height="1" fill={DETAIL} opacity="0.9" />
    <rect x="7" y="9" width="2" height="1" fill={DETAIL} opacity="0.7" />
  </svg>
)

/* ── Desk ─────────────────────────────────────────────────────────── */

const DeskIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={DESK_BG} />
    <rect x="2" y="7" width="12" height="1" fill={DETAIL} />
    <rect x="3" y="8" width="1" height="4" fill={DETAIL} opacity="0.7" />
    <rect x="12" y="8" width="1" height="4" fill={DETAIL} opacity="0.7" />
    <rect x="9" y="5" width="3" height="2" rx="0.5" fill={DETAIL} opacity="0.4" />
  </svg>
)

const LampIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={DESK_BG} />
    <rect x="6" y="12" width="4" height="1" fill={DETAIL} />
    <rect x="7" y="8" width="2" height="4" fill={DETAIL} opacity="0.7" />
    <rect x="5" y="5" width="6" height="3" rx="1" fill={DETAIL} />
  </svg>
)

const PlantIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={DESK_BG} />
    <rect x="5" y="10" width="6" height="3" rx="1" fill={DETAIL} opacity="0.7" />
    <rect x="7" y="5" width="2" height="2" fill={DETAIL} />
    <rect x="5" y="7" width="2" height="2" fill={DETAIL} />
    <rect x="9" y="7" width="2" height="2" fill={DETAIL} />
    <rect x="7" y="7" width="2" height="3" fill={DETAIL} opacity="0.5" />
  </svg>
)

const ChairIcon = () => (
  <svg {...baseProps}>
    <rect x="2" y="2" width="12" height="12" rx="2" fill={DESK_BG} />
    <rect x="6" y="5" width="4" height="4" rx="1" fill={DETAIL} opacity="0.7" />
    <rect x="5" y="9" width="6" height="2" rx="1" fill={DETAIL} />
    <rect x="5" y="11" width="1" height="3" fill={DETAIL} opacity="0.5" />
    <rect x="10" y="11" width="1" height="3" fill={DETAIL} opacity="0.5" />
  </svg>
)

/* ── Brand icons — kept real, scaled to 16×16 ─────────────────────── */

const GithubIcon = () => (
  <svg {...baseProps}>
    <g transform="scale(0.667)">
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
        fill="currentColor"
      />
    </g>
  </svg>
)

const FigmaIcon = () => (
  <svg {...baseProps}>
    <g transform="scale(0.667)">
      <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83" />
      <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF" />
      <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E" />
      <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262" />
      <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE" />
    </g>
  </svg>
)

const SpotifyIcon = () => (
  <svg {...baseProps}>
    <g transform="scale(0.667)">
      <circle cx="12" cy="12" r="10" fill="#1DB954" />
      <path d="M7.5 9.5c3-1 6.5-1 9.5.5M8 12.5c2.5-1 5-.8 7 .5M8.5 15.5c2-.7 4-.5 5.5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
)

export const USES_ICONS: Record<string, () => ReactNode> = {
  laptop: LaptopIcon,
  keyboard: KeyboardIcon,
  mouse: MouseIcon,
  monitor: MonitorIcon,
  terminal: TerminalIcon,
  vscode: VsCodeIcon,
  vite: ViteIcon,
  cloudflare: CloudflareIcon,
  github: GithubIcon,
  notion: NotionIcon,
  obsidian: ObsidianIcon,
  figma: FigmaIcon,
  spotify: SpotifyIcon,
  desk: DeskIcon,
  lamp: LampIcon,
  plant: PlantIcon,
  chair: ChairIcon,
}
