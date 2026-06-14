<p align="center">
  <strong>wica</strong><br>
  <em>a personal portfolio &mdash; minimalist, monochrome, alive</em>
</p>

<p align="center">
  <code>Vite 5</code>
  <code>React 19</code>
  <code>TypeScript</code>
  <code>Tailwind v4</code>
  <code>Framer Motion</code>
  <code>MDX</code>
  <code>KaTeX</code>
</p>

<p align="center">
  <a href="LICENSE">MIT</a>
  &middot;
  <a href="https://github.com/williamcachamwri/wica">source</a>
</p>

<br>

---

## overview

A single-page portfolio built with an obsessive attention to detail. Every pixel, transition, and interaction is intentional. The design is monochrome with a single accent color — minimalism that does not feel cold.

### what makes it different

- **Dark / light theme** — toggled via an expanding-circle CSS pseudo-element overlay. The animation originates from the toggle button position. No JavaScript-driven clipping. Just `box-shadow: 0 0 0 9999px` and a `cubic-bezier` curve.
- **Custom accent color** — five carefully chosen hues (Blue, Rose, Amber, Emerald, Violet). Persisted to `localStorage`. Every accent reference in the stylesheet is a `var(--accent)` call.
- **Custom cursor** — a `requestAnimationFrame`-driven dot with a trailing glassmorphism ring. Click ripples. Hidden on touch devices via `pointer: coarse` media query.
- **Floating navbar** — glassmorphism panel with accent picker, theme toggle, and inspector toggle. ArrowUp hides it. ArrowDown shows it. Escape dismisses the inspector.
- **Element inspector** — an overlay that calls `document.elementFromPoint` on hover, highlights the element with a blue outline, and displays its tag, classes, and dimensions in a tooltip. Click logs the full element to console.
- **Curtain loader** — two black panels split vertically with a center-line glow. Gated by `sessionStorage` — shown once per session.
- **Toast notification system** — dispatched via a custom `window` event. No context provider. The `showToast()` function creates a `CustomEvent` that the `ToastContainer` listens for.
- **Code-block copy button** — injected into `<pre>` elements via `useEffect`. Shows a green checkmark for 1.8 seconds after copy.

<br>

---

## pages

### home

The entry point. A loader gates the experience, then the page fades in through staggered section reveals.

- **Hero** — pixel-art sprite frame, gradient name title with a hover-sweep animation, a `CyclingTypewriter` that rotates through 12 developer-culture phrases, a playful bio, and four contact links (GitHub, email, blog, GitHub profile).
- **Projects** — three featured projects (`Tiny Tasks`, `Quiet Reader`, `fmtpkg`), each rendered as a `ProjectCard` with an SVG icon, description, and tech badges.
- **Memories** — a static polaroid photo desk. Four photographs in white frames with slight rotation offsets. Always white regardless of theme.
- **Footer** — navigation, quick links, and a credit line.

### blog

Two rendering pipelines:

- **MDX posts** (`.mdx`) — imported at build time via `import.meta.glob`. Supports inline React components (`<Callout>`, `<Counter>`, `<PixelBox>`, `<Math>`) and JSX within Markdown.
- **Markdown posts** (`.md`) — fetched at runtime from `/posts/{slug}.md` via `fetch()`. Rendered through `react-markdown` with `remark-gfm`, `remark-math`, `rehype-raw`, `rehype-highlight`, and `rehype-katex`.

Both pipelines feed into the same `BlogPost` layout — a minimal reading experience with `max-w-[680px]` measure, JetBrains Mono for metadata, and Inter for body text.

### universe

An interactive black hole rendered on a `<canvas>` element. The simulation includes:

- **Accretion disk** — a velocity-dependent Doppler beaming effect. Inner edge glows blue-white; outer edge shifts to red-orange.
- **Photon ring** — a bright ring at the photon sphere boundary. Width and brightness oscillate sinusoidally.
- **Gravitational lensing** — stars behind the black hole are distorted according to the Schwarzschild lens equation:  
  `θ = (β + √(β² + 4θₑ²)) / 2`
- **Spiraling particles** — particles accelerate and brighten as they approach the event horizon.
- **Pixel-art objects** — an astronaut, rocket, comet, satellite, flag, and UFO drift around the scene, rendered as colored grids on the canvas.
- **Star field** — 300+ pre-generated stars with twinkle animations.

The canvas adapts to viewport size via `ResizeObserver` and runs at 60 fps.

### 404

A "lost in space" page that displays the current path and invites exploration.

<br>

---

## project structure

<pre>
├── <a href="https://github.com/williamcachamwri/wica/blob/main/src">src</a>/
│   ├── <a href="https://github.com/williamcachamwri/wica/blob/main/src/components">components</a>/          # Reusable UI primitives
│   │   ├── CustomCursor.tsx     # requestAnimationFrame cursor loop
│   │   ├── CyclingTypewriter.tsx # Rotating phrase typewriter
│   │   ├── FloatingNavbar.tsx   # Glassmorphism navigation bar
│   │   ├── InlineLink.tsx       # Animated underline link
│   │   ├── Inspector.tsx        # elementFromPoint inspector overlay
│   │   ├── Loader.tsx           # Curtain-style entrance loader
│   │   ├── PageTransition.tsx   # Framer Motion route wrapper
│   │   ├── PhotoCard.tsx        # Polaroid photograph frame
│   │   ├── PixelRenderer.tsx    # SVG pixel-art grid renderer
│   │   ├── ProjectCard.tsx      # Project showcase card
│   │   ├── SectionDivider.tsx   # Animated section heading
│   │   ├── SpriteWithFirework.tsx # Animated pixel sprite
│   │   ├── Toast.tsx            # Global toast notification
│   │   └── Typewriter.tsx       # Character-by-character typing
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/blob/main/src/pages">pages</a>/               # Route-level components
│   │   ├── Home.tsx             # Loader gate + section composition
│   │   ├── BlogList.tsx         # Chronological post index
│   │   ├── BlogPost.tsx         # MDX / Markdown renderer
│   │   ├── Universe.tsx         # Black-hole canvas page
│   │   └── NotFound.tsx         # Catch-all 404 page
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/blob/main/src/sections">sections</a>/            # Home page sections
│   │   ├── Hero.tsx             # Sprite + title + typewriter + bio
│   │   ├── Projects.tsx         # Project cards grid
│   │   ├── Memories.tsx         # Polaroid photo desk
│   │   └── Footer.tsx           # Links and credits
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/blob/main/src/features">features</a>/
│   │   └── garden/              # Black-hole canvas engine
│   │       ├── types.ts
│   │       ├── hooks/
│   │       │   ├── use-ambient-drift.ts
│   │       │   └── use-garden-element-animation.ts
│   │       ├── utils/
│   │       │   ├── garden-world-config.ts
│   │       │   ├── pixel-garden-elements.ts
│   │       │   └── pixel-terrain-data.ts
│   │       └── components/
│   │           ├── pixel-garden-canvas.tsx
│   │           ├── pixel-garden-element-renderer.tsx
│   │           └── ambient-garden-element.tsx
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/blob/main/src/mdx">mdx</a>/                  # MDX component library
│   │   ├── components.tsx       # Component mappings
│   │   └── Math.tsx             # LaTeX math component
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/blob/main/src/posts">posts</a>/                # Blog MDX files
│   ├── <a href="https://github.com/williamcachamwri/wica/blob/main/src/data">data</a>/                 # Static content metadata
│   │   ├── allPosts.ts          # Combined + sorted post list
│   │   ├── posts.ts             # Markdown post metadata
│   │   ├── projects.tsx         # Project definitions
│   │   ├── photos.ts            # Polaroid photo data
│   │   ├── home-sprites.ts      # Hero sprite definitions
│   │   └── sprites.tsx          # Reusable sprite data
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/blob/main/src/lib">lib</a>/                  # Utilities and loaders
│   │   ├── posts.ts             # frontmatter parser + fetchPost
│   │   └── mdxPosts.ts          # import.meta.glob MDX loader
│   │
│   ├── <a href="https://github.com/williamcachamwri/wica/blob/main/src/types">types</a>/                # Shared TypeScript interfaces
│   │   └── index.ts
│   │
│   ├── App.tsx                  # Root shell (router, theme, navbar)
│   ├── App.css                  # Global layout + animations
│   ├── index.css                # CSS custom properties + Tailwind
│   └── main.tsx                 # ReactDOM entry point
│
└── <a href="https://github.com/williamcachamwri/wica/blob/main/public">public</a>/
    └── posts/                   # Markdown blog sources (.md)
</pre>

<br>

---

## tech

| area | choice |
|---|---|
| **build tool** | [Vite 5](https://vite.dev) |
| **framework** | [React 19](https://react.dev) |
| **language** | [TypeScript 5.7](https://www.typescriptlang.org) |
| **styling** | [Tailwind CSS v4](https://tailwindcss.com) + CSS custom properties |
| **routing** | [React Router 7](https://reactrouter.com) |
| **animations** | [Framer Motion](https://www.framer.com/motion/), CSS keyframes, Canvas API |
| **content** | [MDX](https://mdxjs.com) + [react-markdown](https://remark.js.org) + remark/rehype |
| **math** | [remark-math](https://github.com/remarkjs/remark-math) + [KaTeX](https://katex.org) |
| **syntax highlighting** | [rehype-highlight](https://github.com/rehypejs/rehype-highlight) |
| **fonts** | Inter, JetBrains Mono, Caveat (via Google Fonts) |

<br>

---

## getting started

```bash
# install
npm install

# dev server at http://localhost:5173
npm run dev

# production build
npm run build

# preview production build
npm run preview
```

<br>

---

## author

**L&ecirc; V&itilde;nh Khang**

- GitHub: [williamcachamwri](https://github.com/williamcachamwri)
- Email: ToshikoSteinhaus01544@hotmail.com

---

<p align="center">
  <sub>built with patience &middot; styled with restraint</sub>
</p>
