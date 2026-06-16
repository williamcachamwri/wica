import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')

const SITE_URL = 'https://wica.info'

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

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
      return {
        slug: f.replace('.md', ''),
        title: frontmatter.title || f.replace('.md', ''),
        date: frontmatter.date || '',
        summary: frontmatter.summary || '',
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
  return [...getMdPosts(), ...mdxPosts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

function buildRss() {
  const items = getAllPosts()
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.summary)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>wica — blog</title>
    <link>${SITE_URL}</link>
    <description>Notes on design, code, and slow living.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}

const rss = buildRss()
fs.writeFileSync(path.join(publicDir, 'feed.xml'), rss, 'utf-8')
console.log('generated: feed.xml')
