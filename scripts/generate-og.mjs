import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')
const ogDir = path.join(publicDir, 'og')

const SITE = {
  name: 'Lê Vĩnh Khang',
  url: 'https://wica.info',
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
  {
    slug: 'uses',
    title: 'Uses',
    description: 'Tools, gear, and software I use every day.',
  },
]

function parseMdFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const result = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()

    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = value.replace(/'/g, '"')
        result[key] = JSON.parse(value)
      } catch {
        result[key] = value.slice(1, -1).split(',').map((s) => s.trim().replace(/['"]/g, ''))
      }
    } else {
      result[key] = value
    }
  }
  return result
}

function getMdPosts() {
  const postsDir = path.resolve(__dirname, '../public/posts')
  if (!fs.existsSync(postsDir)) return []
  return fs.readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8')
      const frontmatter = parseMdFrontmatter(raw)
      const slug = f.replace('.md', '')
      const content = raw.replace(/^---[\s\S]*?\n---\n?/, '').trim()
      const wordCount = content.split(/\s+/).filter(Boolean).length
      return {
        slug,
        title: frontmatter.title || slug,
        date: frontmatter.date || '',
        summary: frontmatter.summary || '',
        wordCount,
        readTime: `${Math.max(1, Math.round(wordCount / 200))} min`,
        tags: frontmatter.tags || [],
      }
    })
}

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
  const mdxPosts = fs.existsSync(mdxDir)
    ? fs.readdirSync(mdxDir)
      .filter((f) => f.endsWith('.mdx'))
      .map((f) => extractMdxMeta(path.join(mdxDir, f)))
      .filter(Boolean)
    : []
  return [...getMdPosts(), ...mdxPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function loadFonts() {
  const [regular, bold] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf').then((r) => r.arrayBuffer()),
    fetch('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf').then((r) => r.arrayBuffer()),
  ])
  return { regular, bold }
}

async function generateOgImage(post, fonts) {
  const SX = 1200 / 1080

  const tagColors = {
    design: '#a78bfa',
    ui: '#34d399',
    code: '#60a5fa',
    philosophy: '#fbbf24',
    meta: '#f472b6',
    writing: '#fb923c',
    hardware: '#f87171',
    nvidia: '#76b900',
    gpu: '#a78bfa',
    'deep-dive': '#60a5fa',
  }

  const tags = Array.isArray(post.tags) ? post.tags : []
  const subtitle = post.summary?.length > 120 ? post.summary.slice(0, 117) + '...' : post.summary || ''

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: '72px',
          background: 'linear-gradient(135deg, #0b0b0b 0%, #1a1a2e 100%)',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'auto' },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { width: 10, height: 10, borderRadius: '50%', background: '#a78bfa' },
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { color: '#a3a3a3', fontSize: 20 * SX, letterSpacing: '0.1em' },
                    children: SITE.name.toUpperCase(),
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: 24 },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: 48 * SX,
                      fontWeight: 700,
                      color: '#f5f5f5',
                      lineHeight: 1.2,
                      letterSpacing: '-0.02em',
                      margin: 0,
                    },
                    children: post.title,
                  },
                },
                subtitle
                  ? {
                      type: 'p',
                      props: {
                        style: {
                          fontSize: 22 * SX,
                          color: '#a3a3a3',
                          lineHeight: 1.5,
                          margin: 0,
                        },
                        children: subtitle,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: 12, marginTop: 'auto', alignItems: 'center' },
              children: [
                {
                  type: 'span',
                  props: {
                    style: { color: '#737373', fontSize: 16 * SX },
                    children: post.date,
                  },
                },
                ...(tags.length > 0
                  ? [
                      {
                        type: 'span',
                        props: {
                          style: { width: 4, height: 4, borderRadius: '50%', background: '#525252' },
                        },
                      },
                      ...tags.slice(0, 3).map((tag) => ({
                        type: 'span',
                        props: {
                          style: {
                            padding: '4px 12px',
                            borderRadius: 9999,
                            fontSize: 14 * SX,
                            color: tagColors[tag] || '#a3a3a3',
                            border: `1px solid ${tagColors[tag] || '#525252'}33`,
                            background: `${tagColors[tag] || '#525252'}15`,
                          },
                          children: tag,
                        },
                      })),
                    ]
                  : []),
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: fonts.regular, weight: 400 },
        { name: 'Inter', data: fonts.bold, weight: 700 },
      ],
    }
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
  const pngBuffer = resvg.render().asPng()

  if (!fs.existsSync(ogDir)) {
    fs.mkdirSync(ogDir, { recursive: true })
  }

  const slug = post.slug || post.slug === 'home' ? post.slug : post.slug
  const outPath = path.join(ogDir, `${slug}.png`)
  if (fs.existsSync(outPath)) {
    console.log(`  - og: ${slug}.png (exists, skipped)`)
    return
  }
  fs.writeFileSync(outPath, pngBuffer)
  console.log(`  ✓ og: ${slug}.png`)
}

async function main() {
  console.log('generating og images…')
  const fonts = await loadFonts()

  const allPosts = getAllPosts()

  for (const page of PAGES) {
    await generateOgImage(page, fonts)
  }

  for (const post of allPosts) {
    await generateOgImage(post, fonts)
  }

  console.log('done: og images generated.')
}

main().catch(console.error)
