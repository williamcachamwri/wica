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

const EditorIcon = () => (
  <svg {...baseProps}>
    <path d="m16 18 4-4" />
    <path d="m14 14 2-2" />
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 9h2M8 13h4" />
  </svg>
)

const TerminalIcon = () => (
  <svg {...baseProps}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m8 9 3 3-3 3M13 15h3" />
  </svg>
)

const DesignIcon = () => (
  <svg {...baseProps}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
  </svg>
)

const NotesIcon = () => (
  <svg {...baseProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
)

const MusicIcon = () => (
  <svg {...baseProps}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
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

const GithubIcon = () => (
  <svg {...baseProps}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

const CloudIcon = () => (
  <svg {...baseProps}>
    <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5S19.5 10 17 10c-.3-3.5-3.2-6-6.8-6a7 7 0 0 0-6.8 5.5C1.4 10 0 11.8 0 14c0 2.8 2.2 5 5 5h12.5z" />
  </svg>
)

const BuildToolIcon = () => (
  <svg {...baseProps}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
)

const KnowledgeIcon = () => (
  <svg {...baseProps}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
)

export const USES_ICONS: Record<string, () => JSX.Element> = {
  laptop: LaptopIcon,
  keyboard: KeyboardIcon,
  mouse: MouseIcon,
  monitor: MonitorIcon,
  editor: EditorIcon,
  terminal: TerminalIcon,
  design: DesignIcon,
  notes: NotesIcon,
  music: MusicIcon,
  desk: DeskIcon,
  lamp: LampIcon,
  plant: PlantIcon,
  github: GithubIcon,
  cloud: CloudIcon,
  buildtool: BuildToolIcon,
  knowledge: KnowledgeIcon,
}
