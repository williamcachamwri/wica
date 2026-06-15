const baseProps = {
  width: '20',
  height: '20',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.75',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true' as const,
}

const LaptopIcon = () => (
  <svg {...baseProps}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M2 18h20" />
  </svg>
)

const KeyboardIcon = () => (
  <svg {...baseProps}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M8 14h8" />
  </svg>
)

const MouseIcon = () => (
  <svg {...baseProps}>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M12 7v2" />
  </svg>
)

const MonitorIcon = () => (
  <svg {...baseProps}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
)

const TerminalIcon = () => (
  <svg {...baseProps}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m8 9 3 3-3 3M13 15h3" />
  </svg>
)

const DeskIcon = () => (
  <svg {...baseProps}>
    <path d="M3 9h18M5 9v9M19 9v9M3 18h18" />
  </svg>
)

const LampIcon = () => (
  <svg {...baseProps}>
    <path d="M9 21h6" />
    <path d="M12 21v-6" />
    <path d="M8 15h8v-3a4 4 0 0 0-8 0v3z" />
    <path d="M12 3v5" />
  </svg>
)

const PlantIcon = () => (
  <svg {...baseProps}>
    <path d="M12 22v-8" />
    <path d="M12 14c-3 0-5-2-5-5s2-5 5-5" />
    <path d="M12 14c3 0 5-2 5-5s-2-5-5-5" />
    <path d="M12 22c-3 0-5-2-5-5h10c0 3-2 5-5 5z" />
  </svg>
)

// Brand logos
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
  </svg>
)

const CloudflareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17.5 19.5c2.485 0 4.5-1.79 4.5-4s-2.015-4-4.5-4c-.21 0-.415.018-.615.05C16.56 7.9 14.23 5.5 11.4 5.5c-2.93 0-5.34 2.13-5.84 4.93C2.77 10.83 1 12.94 1 15.5c0 2.76 2.24 5 5 5h11.5z" fill="#F48120" />
    <path d="M17.5 19.5c2.485 0 4.5-1.79 4.5-4s-2.015-4-4.5-4c-.21 0-.415.018-.615.05C16.56 7.9 14.23 5.5 11.4 5.5c-2.93 0-5.34 2.13-5.84 4.93C2.77 10.83 1 12.94 1 15.5c0 2.76 2.24 5 5 5h11.5z" fill="url(#cf-gradient)" opacity="0.8" />
    <defs>
      <linearGradient id="cf-gradient" x1="1" y1="5.5" x2="22" y2="20.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F48120" />
        <stop offset="1" stopColor="#FAAD3F" />
      </linearGradient>
    </defs>
  </svg>
)

const ViteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M23.67 2.87 12.85 22.1a.57.57 0 0 1-.99.05L.32 2.88a.56.56 0 0 1 .55-.83l11.2 2.02a.56.56 0 0 0 .2 0l10.85-2.02a.56.56 0 0 1 .55.82z" fill="#646CFF" />
    <path d="m17.04 1.32-7.6 1.51-5.2-1.03a.55.55 0 0 0-.57.84l9.04 15.93L17.6 2.16a.55.55 0 0 0-.56-.84z" fill="#CFCFFF" />
    <path d="m14.36 2.47-5.95 1.18-4.08-.8a.44.44 0 0 0-.45.66l7.07 12.45 7.35-12.7a.44.44 0 0 0-.44-.66l-3.5.67z" fill="#FFD62A" />
  </svg>
)

const ObsidianIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" fill="#7C3AED" />
    <path d="M12 2v20M3 7l9 5 9-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const VsCodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17.5 0 10 7.5 5.5 4 2 6.5v11L5.5 20l4.5-3.5L17.5 24 23 21V3l-5.5-3zM5.5 16.5V7.5l3.5 2.5-3.5 6.5zM17 14.5l-5-3.5 5-3.5v7z" fill="#007ACC" />
  </svg>
)

const FigmaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83" />
    <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF" />
    <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E" />
    <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262" />
    <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE" />
  </svg>
)

const SpotifyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#1DB954" />
    <path d="M7.5 9.5c3-1 6.5-1 9.5.5M8 12.5c2.5-1 5-.8 7 .5M8.5 15.5c2-.7 4-.5 5.5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const NotionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.46 3.5 15.5.5c.4-.1.75.1.85.5l2 4.5c.1.3 0 .6-.3.8l-2.5 1.5 2 9.5c.1.5-.2 1-.7 1.1l-11 2.5c-.4.1-.8-.1-.9-.5l-2-4.5c-.1-.3 0-.7.3-.8l2.5-1.5-2-9.5c-.1-.5.2-1 .71-1.1zM16 2.3 5.5 5c-.2.1-.3.2-.3.4l2 9.5c.1.3.3.4.6.4l10.5-2.4c.3-.1.4-.3.4-.6l-2-9.5c-.1-.3-.3-.4-.6-.5z" />
  </svg>
)

export const USES_ICONS: Record<string, () => JSX.Element> = {
  laptop: LaptopIcon,
  keyboard: KeyboardIcon,
  mouse: MouseIcon,
  monitor: MonitorIcon,
  terminal: TerminalIcon,
  desk: DeskIcon,
  lamp: LampIcon,
  plant: PlantIcon,
  github: GithubIcon,
  cloudflare: CloudflareIcon,
  vite: ViteIcon,
  obsidian: ObsidianIcon,
  vscode: VsCodeIcon,
  figma: FigmaIcon,
  spotify: SpotifyIcon,
  notion: NotionIcon,
}
