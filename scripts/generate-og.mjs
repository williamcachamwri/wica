import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { posts } from '../src/data/posts.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')
const ogDir = path.join(publicDir, 'og')

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

const SITE = {
  name: 'Lê Vĩnh Khang',
  url: 'https://williamcachamwri.github.io/wica',
}

async function fetchFont() {
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'
  const css = await fetch(cssUrl).then((r) => r.text())
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1])
  const regularUrl = urls.find((u) => u.includes('Inter-Regular')) || urls[0]
  const boldUrl = urls.find((u) => u.includes('Inter-Bold')) || urls[urls.length - 1]

  const [regular, bold] = await Promise.all([
    fetch(regularUrl).then((r) => r.arrayBuffer()),
    fetch(boldUrl).then((r) => r.arrayBuffer()),
  ])

  return [
    { name: 'Inter', data: Buffer.from(regular), weight: 400, style: 'normal' },
    { name: 'Inter', data: Buffer.from(bold), weight: 700, style: 'normal' },
  ]
}

function ogTemplate({ title, description, subtitle, isHome = false }) {
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
            style: { display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 },
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
            style: { display: 'flex', flexDirection: 'column', zIndex: 1, maxWidth: '1000px' },
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
              zIndex: 1,
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
  const fonts = await fetchFont()

  await generatePNG(
    ogTemplate({
      isHome: true,
      title: 'Lê Vĩnh Khang',
      description: 'Developer & maker. Building tiny web toys and thoughtful interfaces.',
      subtitle: 'built with patience · styled with restraint',
    }),
    fonts,
    path.join(publicDir, 'og-image.png'),
  )

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
