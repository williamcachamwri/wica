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

// Brand logos — inline SVGs
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
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

// Brand logos — image assets
function LogoIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="uses-logo">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </span>
  )
}

const VsCodeIcon = () => <LogoIcon src="/icons/vscode.jpg" alt="VS Code" />
const CloudflareIcon = () => <LogoIcon src="/icons/cloudflare.png" alt="Cloudflare" />
const ViteIcon = () => <LogoIcon src="/icons/vite.png" alt="Vite" />
const ObsidianIcon = () => <LogoIcon src="/icons/obsidian.png" alt="Obsidian" />
const NotionIcon = () => <LogoIcon src="/icons/notion.png" alt="Notion" />

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
