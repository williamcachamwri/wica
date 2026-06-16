/**
 * Sync external blog posts via dev.to API + free AI (Hugging Face / NVIDIA / Alibaba).
 *
 * Sources:
 *   - dev.to (https://dev.to/api/articles?username=...)
 *
 * AI providers (checked in order, first available key wins):
 *   1. Hugging Face (HF_TOKEN) — free 30k req/month
 *   2. NVIDIA (NVIDIA_API_KEY) — free tier
 *   3. Alibaba Qwen (ALIBABA_API_KEY) — free tier
 *
 * If no API key is set, falls back to raw content (no AI rewrite).
 * Dry-run: set DRY_RUN=1 to skip writing files.
 */

const IMPORTS_FILE = new URL('imported-posts.json', import.meta.url)
const TRACKING_MARKER = '--- imported via sync-blogs ---\n'

// ─── RSS/Atom feed parser (no dependencies) ─────────────────────────
function parseRssFeed(xml, feedId) {
  const items = []
  const isAtom = xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"')

  if (isAtom) {
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
    for (const entry of entries) {
      const title = extractXmlValue(entry, 'title')
      const url =
        extractXmlAttr(entry, 'link', 'href') ||
        (entry.match(/<link[^>]*href="([^"]+)"/) || [])[1] || ''
      const description = extractXmlValue(entry, 'summary') || extractXmlValue(entry, 'content')
      const dateRaw = extractXmlValue(entry, 'published') || extractXmlValue(entry, 'updated') || ''
      const date = dateRaw.split('T')[0] || ''
      const tags = [...entry.matchAll(/<category[^>]*term="([^"]+)"/g)].map((m) => m[1])
      items.push({ feedId, title, url, description, date, tags })
    }
  } else {
    const entries = xml.match(/<item>[\s\S]*?<\/item>/g) || []
    for (const entry of entries) {
      const title = extractXmlValue(entry, 'title')
      const url =
        extractXmlValue(entry, 'link') ||
        (entry.match(/<link[^>]*href="([^"]+)"/) || [])[1] || ''
      const description = extractXmlValue(entry, 'description') || extractXmlValue(entry, 'content:encoded')
      const dateRaw = extractXmlValue(entry, 'pubDate') || extractXmlValue(entry, 'dc:date') || ''
      const date = dateRaw.split('T')[0] || new Date(dateRaw).toISOString().split('T')[0] || ''
      const tags = [
        ...entry.matchAll(/<category[^>]*>([^<]+)<\/category>/g),
        ...entry.matchAll(/<dc:subject[^>]*>([^<]+)<\/dc:subject>/g),
      ].map((m) => m[1])
      items.push({ feedId, title, url, description, date, tags })
    }
  }

  return items
}

function extractXmlValue(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))
  return m ? decodeHtml(m[1].trim()) : ''
}

function extractXmlAttr(xml, tag, attr) {
  const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`))
  return m ? m[1] : ''
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

// ─── Sources ─────────────────────────────────────────────────────────
// Thêm feed RSS bạn muốn sync vào đây
const SOURCES = [
  {
    id: 'devto-feed',
    name: 'dev.to feed',
    feedUrl: 'https://dev.to/feed',
    async fetch() {
      const res = await fetch(this.feedUrl)
      if (!res.ok) throw new Error(`${this.feedUrl}: ${res.status}`)
      const xml = await res.text()
      const items = parseRssFeed(xml, this.id)
      return items.map((item, i) => ({
        sourceId: `${this.id}-${slugify(item.title)}-${i}`,
        url: item.url,
        title: item.title,
        description: item.description
          ? item.description.replace(/<[^>]*>/g, '').slice(0, 300)
          : '',
        tags: item.tags.filter(Boolean),
        date: item.date || '',
        body: item.description || '',
      }))
    },
  },
]

async function loadImported() {
  try {
    const text = await fs.readFile(IMPORTS_FILE, 'utf-8')
    return JSON.parse(text)
  } catch {
    return {}
  }
}

function saveImported(map) {
  return fs.writeFile(IMPORTS_FILE, JSON.stringify(map, null, 2) + '\n')
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const AI_PROVIDERS = [
  {
    name: 'Hugging Face',
    key: () => process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || '',
    model: 'mistralai/Mistral-7B-Instruct-v0.3',
    async call(prompt) {
      const token = this.key()
      const url = `https://api-inference.huggingface.co/models/${this.model}/v1/chat/completions`
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You convert blog articles into clean MDX format. Output only the MDX content, no explanations.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 4096,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`HuggingFace ${res.status}: ${err.slice(0, 200)}`)
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },
  {
    name: 'NVIDIA',
    key: () => process.env.NVIDIA_API_KEY || '',
    model: 'mistralai/mistral-7b-instruct-v0.3',
    async call(prompt) {
      const token = this.key()
      const url = 'https://integrate.api.nvidia.com/v1/chat/completions'
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You convert blog articles into clean MDX format. Output only the MDX content, no explanations.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 4096,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`NVIDIA ${res.status}: ${err.slice(0, 200)}`)
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },
  {
    name: 'Alibaba Qwen',
    key: () => process.env.ALIBABA_API_KEY || '',
    model: 'qwen2.5-7b-instruct',
    async call(prompt) {
      const token = this.key()
      const url = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You convert blog articles into clean MDX format. Output only the MDX content, no explanations.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 4096,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Alibaba ${res.status}: ${err.slice(0, 200)}`)
      }
      const data = await res.json()
      return data.choices?.[0]?.message?.content || ''
    },
  },
]

function getActiveProvider() {
  for (const p of AI_PROVIDERS) {
    if (p.key()) return p
  }
  return null
}

function parseGeneratedMdx(text) {
  let meta = { title: '', date: '', summary: '', tags: [] }
  let content = text

  const metaMatch = text.match(
    /export\s+const\s+meta\s*=\s*\{([\s\S]*?)\}/
  )
  if (metaMatch) {
    const block = metaMatch[1]
    const getVal = (key) => {
      const m = block.match(new RegExp(`${key}\\s*:\\s*(.+)`))
      if (!m) return undefined
      let v = m[1].trim().replace(/,$/, '')
      if (v.startsWith("'") || v.startsWith('"')) v = v.slice(1, -1)
      if (v.startsWith('[')) {
        try {
          v = JSON.parse(v)
        } catch {
          v = v.replace(/[\[\]\s'"]/g, '').split(',')
        }
      }
      return v
    }
    meta.title = getVal('title') || ''
    meta.date = getVal('date') || ''
    meta.summary = getVal('summary') || ''
    meta.tags = getVal('tags') || []

    const afterMeta = text.slice(metaMatch.index + metaMatch[0].length)
    content = afterMeta.replace(/^\s*\n*/, '').trim()
  }

  return { meta, content }
}

async function processArticle(provider, article, dryRun) {
  const slug = `imported-${slugify(article.title)}`
  const filePath = new URL(`../src/posts/${slug}.mdx`, import.meta.url)

  let body = article.body

  if (provider) {
    console.log(`  → ${provider.name} generating MDX for "${article.title}"...`)
    const prompt = `Convert this article into an MDX blog post in English.

Rules:
- export const meta = { slug: "${slug}", title: "...", date: "${article.date}", summary: "...", tags: [...] }
- summary: 1-2 sentences.
- tags: 2-5 keywords.
- slug is "${slug}" — keep it exactly.
- Rewrite in your own words, preserve facts and code blocks.
- No React/JSX imports.
- No \`\`\` fence wrapping.
- End with: ${TRACKING_MARKER.trim()}
- Add: *Originally published at ${article.url}*

Article:
${body.slice(0, 8000)}`

    let result = ''
    try {
      result = await provider.call(prompt)
    } catch (err) {
      console.error(`    ✗ ${provider.name} failed: ${err.message}`)
      // fallback: try next provider or write raw
      throw err
    }

    const { meta, content } = parseGeneratedMdx(result)

    if (!meta.title) meta.title = article.title
    if (!meta.date) meta.date = article.date
    if (!meta.summary) meta.summary = article.description || ''
    if (!meta.tags || meta.tags.length === 0) meta.tags = article.tags

    body = `export const meta = {
  slug: '${slug}',
  title: '${meta.title.replace(/'/g, "\\'")}',
  date: '${meta.date}',
  summary: '${meta.summary.replace(/'/g, "\\'")}',
  tags: [${(meta.tags || []).map((t) => `'${t}'`).join(', ')}],
}

${content || ''}`
  } else {
    console.log(`  → No AI provider available, writing raw for "${article.title}"`)
    body = `export const meta = {
  slug: '${slug}',
  title: '${article.title.replace(/'/g, "\\'")}',
  date: '${article.date}',
  summary: '${(article.description || '').replace(/'/g, "\\'")}',
  tags: [${article.tags.map((t) => `'${t}'`).join(', ')}],
}

${article.body.slice(0, 5000)}
`
  }

  if (!dryRun) {
    await fs.writeFile(filePath, body)
    console.log(`  ✓ Written: src/posts/${slug}.mdx`)
  } else {
    console.log(`  [dry-run] Would write: src/posts/${slug}.mdx`)
  }

  return slug
}

// ─── Main ───────────────────────────────────────────────────────────
import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'

const dryRun = process.env.DRY_RUN === '1'

async function main() {
  const provider = getActiveProvider()
  if (provider) {
    console.log(`🤖 AI provider: ${provider.name} (${provider.model})`)
  } else {
    console.log('⚠️  No AI API key set — posts will be saved raw without AI rewrite.')
    console.log('   Set one of: HF_TOKEN, NVIDIA_API_KEY, ALIBABA_API_KEY')
  }

  const imported = await loadImported()
  const slugs = []

  for (const source of SOURCES) {
    console.log(`\n📡 Fetching from ${source.name}...`)
    let articles
    try {
      articles = await source.fetch()
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`)
      continue
    }

    console.log(`  Found ${articles.length} articles`)

    for (const article of articles) {
      if (imported[article.sourceId]) {
        console.log(`  Skipping (already imported): ${article.title}`)
        continue
      }

      try {
        const slug = await processArticle(provider, article, dryRun)
        imported[article.sourceId] = {
          slug,
          title: article.title,
          url: article.url,
          importedAt: new Date().toISOString(),
        }
        slugs.push(slug)
      } catch (err) {
        console.error(`  ✗ Failed for "${article.title}": ${err.message}`)
        // try raw fallback
        try {
          const slug = await processArticle(null, article, dryRun)
          imported[article.sourceId] = {
            slug,
            title: article.title,
            url: article.url,
            fallback: true,
            importedAt: new Date().toISOString(),
          }
          slugs.push(slug)
        } catch (fallbackErr) {
          console.error(`  ✗ Raw fallback also failed: ${fallbackErr.message}`)
        }
      }

      await new Promise((r) => setTimeout(r, 1500))
    }
  }

  if (!dryRun) {
    await saveImported(imported)
    console.log(`\n✅ Done. Imported ${slugs.length} new post(s).`)
  } else {
    console.log(`\n[dry-run] Done. Would import ${slugs.length} new post(s).`)
  }

  if (slugs.length > 0) {
    console.log('\nNew posts:')
    slugs.forEach((s) => console.log(`  - src/posts/${s}.mdx`))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
