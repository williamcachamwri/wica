<p align="center">
  <a href="https://wica.info">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://wica.info/og-image.png">
      <img src="https://wica.info/og-image.png" alt="wica" width="640">
    </picture>
  </a>
</p>

<p align="center">
  <code>wica</code> &mdash; a personal portfolio &middot; minimalist &middot; monochrome &middot; alive
</p>

<p align="center">
  <a href="https://wica.info"><img src="https://img.shields.io/badge/live-wica.info-000?style=flat-square&logo=cloudflarepages&logoColor=white" alt="Live"></a>
  <a href="https://github.com/williamcachamwri/wica"><img src="https://img.shields.io/badge/source-github-181717?style=flat-square&logo=github&logoColor=white" alt="Source"></a>
  <a href="https://wica.info/feed.xml"><img src="https://img.shields.io/badge/rss-feed-orange?style=flat-square&logo=rss&logoColor=white" alt="RSS"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-^5.4-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite">
  <img src="https://img.shields.io/badge/React-^19-61DAFB?logo=react&logoColor=white&style=flat-square" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-^5.7-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_v4-0F172A?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind v4">
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white&style=flat-square" alt="Framer Motion">
  <img src="https://img.shields.io/badge/MDX-1B1F24?logo=mdx&logoColor=white&style=flat-square" alt="MDX">
  <img src="https://img.shields.io/badge/Cloudflare_Pages-F38020?logo=cloudflarepages&logoColor=white&style=flat-square" alt="Cloudflare Pages">
  <img src="https://img.shields.io/badge/KaTeX-008080?logo=latex&logoColor=white&style=flat-square" alt="KaTeX">
</p>

<br>

---

## ✦ Overview

**wica** is a single-page portfolio built with obsessive attention to detail. Every pixel, transition, and interaction is intentional — monochrome with a single accent color, minimalism that does not feel cold.

```text
https://wica.info
```

### What makes it different

| Trait | Detail |
|---|---|
| **Dark / Light theme** | Expanding-circle CSS pseudo-element overlay. Animation originates from the toggle button position — no JS clipping, just `box-shadow: 0 0 0 9999px` + `cubic-bezier`. |
| **Custom accent color** | Five hues (Blue, Rose, Amber, Emerald, Violet). Persisted to `localStorage`. Every accent reference is a `var(--accent)` CSS property. |
| **Custom cursor** | `requestAnimationFrame`-driven dot with trailing glassmorphism ring + click ripples. Hidden on `pointer: coarse` devices. |
| **Floating navbar** | Glassmorphism panel with accent picker, theme toggle, search, sound toggle. `ArrowUp` hides, `ArrowDown` shows. |
| **Element inspector** | Calls `document.elementFromPoint` on hover — highlights element, shows tag/class/dimensions in tooltip. Click logs to console. |
| **Curtain loader** | Two black panels split vertically with a center-line glow. Gated by `sessionStorage` — shown once per session. |
| **Toast system** | Custom `window` event dispatching — no context provider. `showToast()` creates a `CustomEvent` consumed by `ToastContainer`. |
| **Code-block copy** | Injected into `<pre>` via `useEffect`. Shows green checkmark for 1.8 s after copy. |
| **Build-time OG + RSS** | `npm run build` generates OpenGraph images for every page/post + RSS feed at `/feed.xml`. |
| **Sound effects** | Toggleable click sounds via Web Audio API. Muted by default. |

<br>

---

## ✦ Pages

### Home

The entry point. A loader gates the experience, then the page fades in through staggered section reveals.

| Section | Description |
|---|---|
| **Hero** | Pixel-art sprite frame (cat, bonsai, Portugal flag with firework), gradient name with hover-sweep, `CyclingTypewriter` rotating through developer phrases, playful bio, four contact links (GitHub, email, blog, GitHub profile), live digital working-hours clock with digit‑roll animation. |
| **GitHub Activity** | Contribution heatmap for the past year via GitHub GraphQL API. Month labels, legend, styled hover tooltip. |
| **World Cup 2026** | Live match tracker with tabs: **Matches**, **Standings**, **Power Rankings**. Auto-refresh every 30 s. Pagination per 5 matches. Group filter chips. Next-match card with accent border. Sticky floating widget at bottom-right. |
| **Projects** | Featured projects (`Tiny Tasks`, `Quiet Reader`, `fmtpkg`). SVG icon, description, tech badges. |
| **Insights** | Interactive analytics chart powered by Cloudflare Zone Analytics. Pure SVG + React, Catmull-Rom curves, hover crosshair, date pill, tooltip, mock-data toggle for demo. |
| **Lighthouse** | Live Lighthouse audit scores with metric sparklines (Performance, Accessibility, Best Practices, SEO). |
| **Memories** | Polaroid photo desk — 5 photos with slight rotation offsets. Click opens Lightbox with prev/next + keyboard navigation. |
| **Footer** | Navigation, quick links, live build info from GitHub, credit. |

### World Cup Match (`/worldcup/:matchId`)

A full match detail page with five animated tabs:

| Tab | Contents |
|---|---|
| **Timeline** | Filtered key events (goals, cards, substitutions) with team-colored layout, own-goal detection, scroll-triggered stagger animation. |
| **Lineups** | SVG pitch with both teams — home bottom-up, away top-down, both attacking toward center. Player avatars (FIFA `PictureUrl`), shirt-number badges, formation pills in header/footer bars. **Click any player** to open a stats modal. |
| **Stats** | Head-to-head comparison bars for 16 stats (possession, shots, passes, cards, etc.). |
| **Table** | Group standings table filtered to the match's group. |
| **Power Ranking** | Per-team power ranking with ATK/DEF/CRE scores for each player, color-coded by rank tier. |

**Own-goal support**: FIFA event Type 34 + regex fallback. Team assignment flipped so per-team counts stay correct. Timeline shows `(OG)` badge on opponent's side. Match cards show `(OG)` next to scorer name.

### Blog

Two rendering pipelines:

- **MDX posts** (`.mdx`) — imported at build via `import.meta.glob`. Supports inline React components: `<Callout>`, `<Counter>`, `<PixelBox>`, `<Math>`, `<InsightsChart>`, `<Mermaid>`.
- **Markdown posts** (`.md`) — fetched at runtime via `fetch()`. Rendered through `react-markdown` with `remark-gfm`, `remark-math`, `rehype-raw`, `rehype-highlight`, `rehype-katex`.

Features: reading progress bar, estimated read time + word count, related posts, tag filtering + search, syntax-highlighted code blocks with copy buttons, KaTeX math, GitHub Discussions-backed comments and likes (OAuth).

### Guestbook

Public guestbook backed by GitHub Discussions. Visitors leave a name + message, react with emoji (thumbs up, heart, laugh, rocket, eyes), solve a Cloudflare Turnstile challenge. Skeleton loading states, client-side pagination.

### Universe

Interactive black hole rendered on `<canvas>` at 60 fps:

- **Accretion disk** — velocity-dependent Doppler beaming, inner edge glows blue-white, outer shifts to red-orange.
- **Photon ring** — bright ring at photon sphere boundary, width/height oscillates sinusoidally.
- **Gravitational lensing** — stars behind the black hole distorted via Schwarzschild lens equation: `θ = (β + √(β² + 4θₑ²)) / 2`.
- **Spiraling particles** — accelerate + brighten toward event horizon.
- **Pixel-art objects** — astronaut, rocket, comet, satellite, flag, UFO rendered as colored grids.
- **Star field** — 300+ pre-generated stars with twinkle animations.
- Canvas adapts via `ResizeObserver`.

### Changelog (`/changelog/:sha`)

Commit detail page fetching from GitHub API with skeleton loading.

### 404

"Lost in space" page showing the current path + invitation to explore.

### Uses (`/uses`)

Gear + software setup page with pixel-art SVG icons for each category (hardware, dev tools, desk setup, design).

<br>

---

## ✦ Architecture

```text
Request ──► Cloudflare Pages ──► Static assets (HTML/JS/CSS/images)
               │
               └── Functions (serverless) ──► External APIs
                   ├── /api/worldcup        FIFA API v3 + FDH
                   ├── /api/now-playing     Spotify
                   ├── /api/insights        Cloudflare Analytics
                   ├── /api/github-contributions  GitHub GraphQL
                   ├── /api/guestbook       GitHub Discussions
                   ├── /api/auth/github     OAuth flow
                   └── /api/blog/*          Comments + likes
```

### FIFA World Cup Data Pipeline

```
FIFA API v3 (calendar, live, timelines)
       │
       ▼
Cloudflare Function (/api/worldcup)
   ├── Fetches match list, groups, standings
   └── If matchId: fetches detail + timelines + FDH stats
         ├── /stats/match/{idIfes}/teams.json  → team stats
         ├── /stats/match/{idIfes}/players.json → per-player stats
         └── /powerranking/match/{idIfes}.json  → power rankings
       │
       ▼
React frontend renders match cards, formation diagram,
stats comparison, timeline, player stats modal, power rankings
```

<br>

---

## ✦ Project Structure

<pre>
├── <a href="https://github.com/williamcachamwri/wica/tree/main/functions">functions/</a>
│   └── api/
│       ├── auth/                # GitHub OAuth (start/callback/logout/user)
│       ├── blog/                # Blog comments + likes via GitHub Discussions
│       ├── guestbook.ts         # Guestbook entries + reactions
│       ├── github-contributions.ts  # GitHub contribution calendar proxy
│       ├── insights.ts          # Cloudflare Zone Analytics proxy
│       ├── now-playing.ts       # Spotify currently-playing proxy
│       ├── worldcup.ts          # FIFA World Cup API proxy + FDH stats
│       └── utils/               # Shared helpers (security, caching)
│
├── <a href="https://github.com/williamcachamwri/wica/tree/main/src">src/</a>
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/components">components/</a>          # 30+ reusable UI primitives
│   │   ├── CustomCursor.tsx     # rAF cursor loop + click ripples
│   │   ├── CyclingTypewriter.tsx# Rotating-phrase typewriter
│   │   ├── FloatingNavbar.tsx   # Glassmorphism nav (search/theme/accent/sound)
│   │   ├── FormationDiagram.tsx # SVG pitch with both teams + player avatars
│   │   ├── PlayerStatsModal.tsx # Player stats popup (porte via createPortal)
│   │   ├── WorldCupSticky.tsx   # Floating LIVE/next-match widget
│   │   ├── InsightsChart.tsx    # Pure SVG Catmull-Rom analytics chart
│   │   ├── Inspector.tsx        # elementFromPoint overlay inspector
│   │   ├── Lightbox.tsx         # Image lightbox (portal, keyboard, touch)
│   │   ├── Loader.tsx           # Curtain entrance loader
│   │   ├── SpriteWithFirework.tsx  # Animated pixel sprite + particle burst
│   │   ├── CommandPalette.tsx   # Cmd+K search/navigate palette
│   │   ├── Toast.tsx            # Global event-driven toast system
│   │   └── ...                  # PhotoCard, ProjectCard, SectionDivider, etc.
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/pages">pages/</a>                # Route-level components
│   │   ├── Home.tsx
│   │   ├── BlogList.tsx
│   │   ├── BlogPost.tsx
│   │   ├── Guestbook.tsx
│   │   ├── Universe.tsx
│   │   ├── WorldCupMatch.tsx
│   │   ├── Changelog.tsx
│   │   ├── Tags.tsx
│   │   ├── Uses.tsx
│   │   └── NotFound.tsx
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/sections">sections/</a>            # Home page sections
│   │   ├── Hero.tsx
│   │   ├── GithubActivity.tsx
│   │   ├── WorldCup.tsx
│   │   ├── Projects.tsx
│   │   ├── Insights.tsx
│   │   ├── LighthouseSection.tsx
│   │   ├── Memories.tsx
│   │   └── Footer.tsx
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/features">features/</a>
│   │   └── garden/             # Black-hole canvas engine
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/mdx">mdx/</a>                  # MDX component library
│   │   ├── components.tsx
│   │   ├── Callout.tsx
│   │   ├── Counter.tsx
│   │   ├── Math.tsx
│   │   ├── Mermaid.tsx
│   │   └── PixelBox.tsx
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/posts">posts/</a>                # Blog MDX files
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/data">data/</a>                 # Static metadata (projects, photos, sprites)
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/lib">lib/</a>                  # Utilities (sound, github, spotify)
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/styles">styles/</a>              # 30+ CSS files (component-scoped)
│   ├── <a href="https://github.com/williamcachamwri/wica/tree/main/src/types">types/</a>                # Shared TypeScript interfaces
│   ├── App.tsx                  # Root shell (router, theme, floating widgets)
│   ├── index.css                # CSS custom properties + Tailwind base
│   └── main.tsx                 # ReactDOM.createRoot entry + StrictMode
│
├── <a href="https://github.com/williamcachamwri/wica/tree/main/scripts">scripts/</a>                 # Build-time generators
│   ├── generate-og.mjs          # Puppeteer OG image generator (13 pages)
│   └── generate-rss.mjs         # RSS feed generator
│
├── <a href="https://github.com/williamcachamwri/wica/tree/main/public">public/</a>
│   ├── posts/                   # Markdown blog sources (.md)
│   ├── og/                      # Generated OpenGraph PNGs
│   └── feed.xml                 # Generated RSS feed
│
├── <a href="https://github.com/williamcachamwri/wica/tree/main/screenshots">screenshots/</a>            # README screenshots
├── vite.config.js               # Vite config with MDX + tailwind plugins
├── tsconfig.json
├── vercel.json
├── wrangler.jsonc               # Cloudflare Pages config
└── eslint.config.js
</pre>

<br>

---

## ✦ Tech Stack

| Area | Choice |
|---|---|
| **Build tool** | [Vite 5](https://vite.dev) |
| **Framework** | [React 19](https://react.dev) |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + 30+ CSS files |
| **Routing** | [React Router 7](https://reactrouter.com) + AnimatePresence |
| **Animations** | [Framer Motion](https://www.framer.com/motion/), CSS keyframes, Canvas API |
| **Content** | [MDX](https://mdxjs.com) + [react-markdown](https://remark.js.org) |
| **Math** | [remark-math](https://github.com/remarkjs/remark-math) + [KaTeX](https://katex.org) |
| **Diagrams** | [Mermaid](https://mermaid.js.org) |
| **Highlighting** | [rehype-highlight](https://github.com/rehypejs/rehype-highlight) |
| **Fonts** | Inter, JetBrains Mono, Caveat (Google Fonts) |
| **Hosting** | [Cloudflare Pages](https://pages.cloudflare.com) |
| **Serverless** | [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/) |
| **Captcha** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |

### Key npm packages

| Package | Use |
|---|---|
| `framer-motion` | Page transitions, tab animation, spring interactions |
| `react-router-dom` | Client-side routing with `createBrowserRouter` |
| `@mdx-js/rollup` | MDX compilation at build time |
| `react-markdown` + plugins | Runtime Markdown rendering |
| `katex` | LaTeX math rendering |
| `mermaid` | Diagram rendering in blog posts |

<br>

---

## ✦ World Cup API Integration

The FIFA World Cup section connects to two upstream APIs:

### FIFA API v3 (`https://api.fifa.com/api/v3`)

| Endpoint | Use |
|---|---|
| `/calendar/matches` | Match list, groups, stages |
| `/live/football/{matchId}` | Match detail (teams, players, formations, scores, ball possession) |
| `/timelines/{matchId}` | Match events (goals, cards, substitutions) |
| `/calendar/{competition}/{season}/{stage}/standing` | Group standings |

### FDH API (`https://fdh-api.fifa.com/v1`)

| Endpoint | Use |
|---|---|
| `/stats/match/{idIfes}/teams.json` | Per-team match statistics |
| `/stats/match/{idIfes}/players.json` | Per-player match statistics |
| `/powerranking/match/{idIfes}.json` | Power ranking data (ATK/DEF/CRE) |

### Data quirks

- **Tactics**: FIFA returns `"4-4-2"` as a plain string (not an object with a `Formation` array).
- **Position**: Player `Position` is a numeric code: `0` = GK, `1` = DEF, `2` = MID, `3` = FWD.
- **Starting XI**: Filtered by `Status === 1` (not `FieldStatus === 0`).
- **Player pictures**: `PictureUrl` needs `?imwidth=80` suffix for small avatars.
- **Own goals**: Detected via `Type === 34` + regex fallback on `EventDescription`.
- **Match status**: `0` = FT, `3` = LIVE, all others = UPCOMING.

<br>

---

## ✦ Getting Started

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:5173
npm run dev

# Production build (includes OG images + RSS)
npm run build

# Preview production build
npm run preview
```

### Environment variables / secrets

Set Cloudflare Pages secrets with:

```bash
npx wrangler pages secret put <NAME> --project-name=wica
```

| Secret | Purpose |
|---|---|
| `SPOTIFY_CLIENT_ID` | Spotify Now Playing widget |
| `SPOTIFY_CLIENT_SECRET` | Spotify Now Playing widget |
| `SPOTIFY_REFRESH_TOKEN` | Spotify Now Playing widget |
| `GITHUB_TOKEN` | GitHub contributions, changelog, guestbook, blog |
| `GITHUB_CLIENT_ID` | GitHub OAuth for blog comments/likes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth for blog comments/likes |
| `TURNSTILE_SECRET` | Guestbook CAPTCHA |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Zone Analytics |
| `CLOUDFLARE_ZONE_ID` | Cloudflare Zone Analytics |

#### Required token permissions

- **GitHub**: `repo`, `read:user`, `read:discussion`
- **Cloudflare**: `Zone:Read`, `Zone Analytics:Read`
- **Spotify**: Premium account + app owner whitelisted in Spotify Dev Dashboard

<br>

---

## ✦ Deployment

```bash
npm run build
npx wrangler pages deploy dist/ --project-name=wica --branch=main
```

The `build` script automatically:

1. Generates OpenGraph images (`scripts/generate-og.mjs`)
2. Generates RSS feed (`scripts/generate-rss.mjs`)
3. Runs `vite build`

### Generated assets

```
public/og-image.png          # Homepage
public/og/blog.png           # Blog list
public/og/worldcup.png       # World Cup section
public/og/universe.png       # Universe page
public/og/uses.png           # Uses page
public/og/404.png            # 404 page
public/og/{slug}.png         # Each blog post
public/feed.xml              # RSS feed
```

### Adding a new page

1. Create the page component in `src/pages/`
2. Add a route in `src/App.tsx`
3. Add an entry to `scripts/generate-og.mjs` in the `PAGES` array
4. Add any required CSS in `src/styles/`

<br>

---

## ✦ Design Notes

- **No charting libraries.** The Insights chart is pure SVG paths with a handwritten Catmull-Rom spline.
- **No cursor on touch.** The custom cursor is disabled via `pointer: coarse` media query.
- **Design tokens.** All colors are CSS custom properties (`--text`, `--surface`, `--border`, `--accent`, etc.) — theme and accent changes propagate instantly without re-renders.
- **Motion respect.** All animations use CSS-driven motion that can be gated behind `prefers-reduced-motion` in the future.
- **Accessible skip link.** A `#main` skip-to-content link is the first focusable element on every page.
- **SEO per page.** The `<SEO>` component sets `<title>`, `<meta name="description">`, OpenGraph tags, and canonical URL for every route.
- **`max-w-[680px]` reading measure.** All content pages use a 680px max-width measure optimized for readability.
- **Pixel art aesthetic.** Icons, sprites, cursors, and section dividers use crisp pixel rendering (`shapeRendering="crispEdges"`).

<br>

---

## ✦ Performance

| Metric | Approach |
|---|---|
| **Code splitting** | Lazy-loaded routes (`React.lazy` + `Suspense`) for WorldCupMatch, Universe, Guestbook, Changelog, Uses, NotFound, BlogPost, Tags |
| **CSS** | Component-scoped CSS files loaded only when parent component mounts |
| **Images** | Lazy loading with `loading="lazy"`, responsive via `srcset` where applicable |
| **API caching** | Cloudflare Functions cache external API responses with appropriate TTLs |
| **Fonts** | Google Fonts with `display=swap`, subset only Latin |
| **Bundle** | Vite code-splitting with manual chunks for heavy deps (mermaid) |

<br>

---

## ✦ Acknowledgements

- Design inspired by **duongductrong** — thank you for the clean, thoughtful reference.
- FIFA World Cup data provided by the **FIFA API v3** and **FDH API**.
- OG images generated with **Puppeteer**.
- Icons use SVG pixel art — no icon libraries.

<br>

---

## ✦ Author

**Lê Vĩnh Khang**

| | |
|---|---|
| **Website** | [wica.info](https://wica.info) |
| **GitHub** | [@williamcachamwri](https://github.com/williamcachamwri) |
| **Email** | ToshikoSteinhaus01544@hotmail.com |

<br>

---

<p align="center">
  <sub>built with patience &middot; styled with restraint</sub>
  <br>
  <sub><code>166 files &middot; 55,584 lines &middot; 30+ CSS files &middot; 30+ components &middot; 10 routes</code></sub>
</p>
