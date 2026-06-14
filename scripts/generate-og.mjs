import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { posts } from '../src/data/posts.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')
const ogDir = path.join(publicDir, 'og')

const SITE = {
  name: 'Lê Vĩnh Khang',
  url: 'https://williamcachamwri.github.io/wica',
}

const PAGES = [
  {
    slug: 'home',
    title: 'wica — minimalist developer portfolio',
    description: 'A personal portfolio by Lê Vĩnh Khang. Notes on design, code, and slow living.',
    subtitle: 'built with patience · styled with restraint',
    isHome: true,
  },
  {
    slug: 'blog',
    title: 'Blog',
    description: 'Notes on design, code, and slow living.',
  },
  {
    slug: 'universe',
    title: 'Universe',
    description: 'An interactive pixel black hole. Light bends, comets drift, and a lone astronaut watches from afar.',
  },
  {
    slug: '404',
    title: 'Lost in space',
    description: 'The page you are looking for does not exist.',
  },
]

function extractMdxMeta(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const match = raw.match(/export\s+const\s+meta\s*=\s*({[\s\S]*?})/)
  if (!match) return null
  try {
    return new Function(`return ${match[1]}`)()
  } catch {
    return null
  }
}

function getAllPosts() {
  const mdxDir = path.resolve(__dirname, '../src/posts')
  const mdxPosts = fs.readdirSync(mdxDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => extractMdxMeta(path.join(mdxDir, f)))
    .filter(Boolean)
  return [...posts, ...mdxPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function loadFonts() {
  const [regular, bold] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf').then((r) => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf').then((r) => r.arrayBuffer()),
  ])
  return [
    { name: 'Inter', data: Buffer.from(regular), weight: 400, style: 'normal' },
    { name: 'Inter', data: Buffer.from(bold), weight: 700, style: 'normal' },
  ]
}

function ogTemplate({ title, description, subtitle, isHome }) {
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#07070a',
        color: '#f4f4f5',
        padding: '64px',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '-200px',
              right: '-200px',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '-150px',
              left: '-150px',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '16px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: 700,
                  },
                  children: 'lvk',
                },
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '22px', fontWeight: 700, color: '#f4f4f5' },
                  children: 'wica',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', maxWidth: '1000px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: isHome ? '72px' : '56px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                    marginBottom: '24px',
                    color: '#f4f4f5',
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '26px',
                    lineHeight: 1.45,
                    color: '#a1a1aa',
                  },
                  children: description,
                },
              },
              subtitle && {
                type: 'div',
                props: {
                  style: {
                    marginTop: '32px',
                    fontSize: '18px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#2563eb',
                  },
                  children: subtitle,
                },
              },
            ].filter(Boolean),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '18px',
              color: '#71717a',
              borderTop: '1px solid #27272a',
              paddingTop: '32px',
            },
            children: [
              { type: 'span', props: { children: SITE.name } },
              { type: 'span', props: { children: SITE.url.replace('https://', '') } },
            ],
          },
        },
      ],
    },
  }
}

async function generatePNG(node, fonts, outPath) {
  const svg = await satori(node, { width: 1200, height: 630, fonts })
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const png = resvg.render()
  fs.writeFileSync(outPath, png.asPng())
  console.log('generated:', path.relative(publicDir, outPath))
}

async function main() {
  fs.mkdirSync(ogDir, { recursive: true })
  const fonts = await loadFonts()

  for (const page of PAGES) {
    const outName = page.slug === 'home' ? 'og-image.png' : `og/${page.slug}.png`
    await generatePNG(
      ogTemplate({
        title: page.title,
        description: page.description,
        subtitle: page.subtitle,
        isHome: page.isHome,
      }),
      fonts,
      path.join(publicDir, outName),
    )
  }

  for (const post of getAllPosts()) {
    await generatePNG(
      ogTemplate({
        title: post.title,
        description: post.summary,
        subtitle: new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      }),
      fonts,
      path.join(ogDir, `${post.slug}.png`),
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
