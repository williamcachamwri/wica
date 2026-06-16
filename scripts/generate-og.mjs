import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
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
    return vm.runInNewContext(`(${match[1]})`, {}, { timeout: 1000 })
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
  return [
    { name: 'Inter', data: Buffer.from(regular), weight: 400, style: 'normal' },
    { name: 'Inter', data: Buffer.from(bold), weight: 700, style: 'normal' },
  ]
}

function ogTemplate({ title, description, subtitle, isHome, tags }) {
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
              tags && tags.length > 0 && {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    gap: '8px',
                    marginTop: '16px',
                    flexWrap: 'wrap',
                  },
                  children: tags.map((tag) => ({
                    type: 'span',
                    props: {
                      style: {
                        display: 'flex',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '15px',
                        fontWeight: 400,
                        color: '#a1a1aa',
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                      },
                      children: tag,
                    },
                  })),
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
  console.log('generating og images…')
  const fonts = await loadFonts()

  for (const page of PAGES) {
    const outName = page.slug === 'home' ? 'og-image.png' : `og/${page.slug}.png`
    const outPath = path.join(publicDir, outName)
    if (fs.existsSync(outPath)) {
      console.log(`  - og: ${page.slug}.png (exists, skipped)`)
      continue
    }
    await generatePNG(
      ogTemplate({
        title: page.title,
        description: page.description,
        subtitle: page.subtitle,
        isHome: page.isHome,
      }),
      fonts,
      outPath,
    )
  }

  for (const post of getAllPosts()) {
    const outPath = path.join(ogDir, `${post.slug}.png`)
    if (fs.existsSync(outPath)) {
      console.log(`  - og: ${post.slug}.png (exists, skipped)`)
      continue
    }
    await generatePNG(
      ogTemplate({
        title: post.title,
        description: post.summary,
        subtitle: new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        tags: post.tags,
      }),
      fonts,
      outPath,
    )
  }

  console.log('done: og images generated.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
