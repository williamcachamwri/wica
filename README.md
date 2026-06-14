<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&height=200&color=0:07070a,50:2563eb,100:07070a&text=wica&fontAlignY=35&fontColor=f4f4f5&reversal=false&section=header&fontSize=60">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=200&color=0:ffffff,50:2563eb,100:ffffff&text=wica&fontAlignY=35&fontColor=07070a&reversal=false&section=header&fontSize=60" width="100%">
</picture>

<p align="center">
  <b>a personal portfolio</b><br>
  <i>minimalist &bull; monochrome &bull; alive</i>
</p>

<br>

<p align="center">
  <a href="https://vite.dev" target="_blank"><img src="https://img.shields.io/badge/vite-^5.4-646CFF?logo=vite&logoColor=white&style=flat-square" alt="Vite"></a>
  <a href="https://react.dev" target="_blank"><img src="https://img.shields.io/badge/react-^19-61DAFB?logo=react&logoColor=white&style=flat-square" alt="React"></a>
  <a href="https://www.typescriptlang.org" target="_blank"><img src="https://img.shields.io/badge/typescript-^5.7-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript"></a>
  <a href="https://tailwindcss.com" target="_blank"><img src="https://img.shields.io/badge/tailwind_v4-0F172A?logo=tailwindcss&logoColor=white&style=flat-square" alt="Tailwind CSS"></a>
  <a href="https://www.framer.com/motion" target="_blank"><img src="https://img.shields.io/badge/framer_motion-0055FF?logo=framer&logoColor=white&style=flat-square" alt="Framer Motion"></a>
  <a href="https://mdxjs.com" target="_blank"><img src="https://img.shields.io/badge/mdx-1B1F24?logo=mdx&logoColor=white&style=flat-square" alt="MDX"></a>
  <a href="https://katex.org" target="_blank"><img src="https://img.shields.io/badge/katex-008080?logo=latex&logoColor=white&style=flat-square" alt="KaTeX"></a>
</p>

<br>

---

<br>

<pre align="center">
  <b>✦  features  ✦</b>

  dark/light theme  ·  accent color picker  ·  custom cursor
  floating navbar  ·  element inspector  ·  toast notifications
  blog (MDX + LaTeX)  ·  black‑hole universe  ·  pixel sprites
  page transitions  ·  responsive  ·  curtain loader
</pre>

<br>

---

<br>

## getting started

```bash
npm install
npm run dev
```

Opens at [`http://localhost:5173`](http://localhost:5173).

### build

```bash
npm run build
npm run preview
```

<br>

---

<br>

## project structure

```
src/
├── components/         # Reusable UI primitives
│   ├── CustomCursor    # Dot + ring + ripple (RAF loop)
│   ├── FloatingNavbar  # Glassmorphism nav with controls
│   ├── Inspector       # Hover-to-inspect overlay
│   ├── Loader          # Curtain-style entrance
│   ├── Toast           # Global notification system
│   ├── PageTransition  # Framer Motion route wrapper
│   ├── ProjectCard     # Project showcase card
│   ├── PhotoCard       # Polaroid photograph
│   ├── PixelRenderer   # SVG pixel-art renderer
│   ├── SpriteWithFirework # Animated sprite
│   ├── Typewriter      # Character-by-character typing
│   ├── CyclingTypewriter # Rotating phrase typewriter
│   └── InlineLink      # Animated underline link
│
├── pages/              # Route pages
│   ├── Home            # Loader → Hero → Projects → Memories → Footer
│   ├── BlogList        # Sorted post index
│   ├── BlogPost        # MDX / Markdown renderer with code-copy
│   ├── Universe        # Interactive black-hole canvas
│   └── NotFound        # 404 page
│
├── sections/           # Home page blocks
│   ├── Hero            # Sprite + title + typewriter + bio
│   ├── Projects        # Featured project cards
│   ├── Memories        # Polaroid photo desk
│   └── Footer          # Links and credits
│
├── features/
│   └── garden/         # Black-hole canvas engine
│       ├── types       # Type definitions
│       ├── hooks/      # useAmbientDrift, useGardenElementAnimation
│       ├── utils/      # Config, elements, terrain
│       └── components/ # Canvas, renderer, ambient elements
│
├── mdx/                # MDX component mappings
├── posts/              # Blog post sources (.mdx)
├── data/               # Static content metadata
├── lib/                # Utilities and loaders
│   ├── posts           # Markdown frontmatter parser
│   └── mdxPosts        # MDX glob loader
│
├── types/              # Shared TypeScript interfaces
├── App.tsx             # Root shell (router + theme + navbar)
├── App.css             # Global styles and animations
├── index.css           # CSS custom properties and theme tokens
└── main.tsx            # Entry point

public/
└── posts/              # Markdown blog sources (.md)
```

<br>

---

<br>

## tech

| | |
|---|---|
| **framework** | Vite 5 + React 19 + TypeScript |
| **styling** | Tailwind CSS v4 + CSS custom properties |
| **routing** | React Router v7 |
| **animation** | Framer Motion, CSS keyframes, Canvas API |
| **content** | MDX + react-markdown + remark/rehype |
| **math** | remark-math + rehype-katex |
| **syntax** | rehype-highlight |
| **fonts** | Inter, JetBrains Mono, Caveat |

<br>

---

<br>

## author

<p>
  <b>Lê Vĩnh Khang</b><br>
  <a href="https://github.com/williamcachamwri">github.com/williamcachamwri</a>
</p>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://capsule-render.vercel.app/api?type=waving&height=120&color=0:2563eb,100:07070a&section=footer&reversal=true">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=120&color=0:2563eb,100:ffffff&section=footer&reversal=true" width="100%">
</picture>
