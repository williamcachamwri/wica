# wica

A personal portfolio — minimalist, monochrome, alive.

Built with Vite, React, TypeScript, and Tailwind CSS. Features a floating navbar, custom cursor, dark/light theme with expanding-circle transition, an interactive black-hole universe, and a blog with MDX and LaTeX support.

## Stack

- **Vite 5** + **React 19** + **TypeScript**
- **Tailwind CSS v4** with CSS custom properties for theming
- **Framer Motion** for page transitions
- **MDX** + **remark** / **rehype** for blog content
- **KaTeX** for LaTeX rendering

## Features

- **Dark / light theme** — persisted in localStorage, toggled via a CSS pseudo-element overlay with expand animation
- **Custom accent colour** — pick from five colours, stored in localStorage
- **Inspector overlay** — hover-highlights elements, shows tag/class/dimensions
- **Custom cursor** — dot + ring + click ripple (hidden on touch devices)
- **Black-hole universe** — canvas-rendered accretion disk, photon ring, gravitational lensing, spiraling particles
- **Blog** — MDX with interactive components, syntax highlighting, code-block copy button
- **Toast notifications** — dispatched via window events, no context provider

## Getting started

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/       # Reusable UI components
│   ├── CustomCursor, FloatingNavbar, Inspector
│   ├── Loader, Toast, PageTransition
│   ├── ProjectCard, PhotoCard, PixelRenderer
│   └── Typewriter, CyclingTypewriter, InlineLink
├── pages/            # Route pages
│   ├── Home, BlogList, BlogPost
│   ├── Universe, NotFound
│   └── SectionDivider
├── sections/         # Home page sections
│   ├── Hero, Projects, Memories, Footer
├── features/         # Feature modules
│   └── garden/       # Black-hole canvas universe
├── mdx/              # MDX component mappings
├── posts/            # Blog post MDX files
├── data/             # Static content data
├── lib/              # Utilities and post loading
├── types/            # TypeScript type definitions
├── App.tsx           # Root with routing and theme
├── index.css         # CSS custom properties and theme tokens
└── main.tsx          # Entry point

public/
└── posts/            # Markdown blog post files
```

## Configuration

- `vite.config.js` — Vite + React + Tailwind + MDX plugins
- `tsconfig.json` — Strict TypeScript config
- `eslint.config.js` — ESLint flat config

## Author

**Lê Vĩnh Khang**  
GitHub: [williamcachamwri](https://github.com/williamcachamwri)
