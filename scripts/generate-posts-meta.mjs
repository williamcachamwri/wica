import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function parseFrontmatter(raw) {
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

const postsDir = path.resolve(__dirname, '../public/posts')
const outFile = path.resolve(__dirname, '../src/data/posts-meta.json')

const posts = fs.readdirSync(postsDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8')
    const frontmatter = parseFrontmatter(raw)
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

fs.writeFileSync(outFile, JSON.stringify(posts, null, 2), 'utf-8')
console.log(`generated: posts-meta.json (${posts.length} posts)`)
