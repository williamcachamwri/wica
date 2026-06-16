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
            { role: 'system', content: 'You rewrite blog articles. Output only valid JSON, no other text.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 8192,
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
    model: 'deepseek-ai/deepseek-v4-pro',
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
            { role: 'system', content: 'You rewrite blog articles. Output only valid JSON, no other text.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 8192,
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
            { role: 'system', content: 'You rewrite blog articles. Output only valid JSON, no other text.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 8192,
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

function extractJson(text) {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('AI response contains no JSON object')
  return JSON.parse(m[0])
}

function hasHtml(text) {
  const htmlRegex = /<(p|br|h[1-6]|div|span|strong|em|b|i|u|ul|ol|li|table|tr|td|th|thead|tbody|tfoot|pre|code|img|a|blockquote|hr|form|input|button|label|section|article|header|footer|main|aside|nav|figure|figcaption)(\s[^>]*)?>/
  return htmlRegex.test(text)
}

function stripHtmlTags(text) {
  return text
    .replace(/<p>/gi, '\n\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<h1>(.*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4>(.*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<li>(.*?)<\/li>/gi, '- $1')
    .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
}

function escapeMdxBraces(text) {
  const lines = text.split('\n')
  let inCodeBlock = false
  return lines.map(line => {
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      return line
    }
    if (inCodeBlock) return line
    return line.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
  }).join('\n')
}

async function processArticle(provider, article, dryRun) {
  const slug = `imported-${slugify(article.title)}`
  const filePath = new URL(`../src/posts/${slug}.mdx`, import.meta.url)

  let body = article.body
  const rawFallback = () => {
    console.log(`  → No AI provider or fallback, writing raw for "${article.title}"`)
    return `export const meta = {
  slug: ${JSON.stringify(slug)},
  title: ${JSON.stringify(article.title)},
  date: ${JSON.stringify(article.date)},
  summary: ${JSON.stringify(article.description || '')},
  tags: [${article.tags.map((t) => JSON.stringify(t)).join(', ')}],
}

${article.body.slice(0, 5000)}
`
  }

  if (provider) {
    console.log(`  → ${provider.name} rewriting "${article.title}"...`)
    const prompt = `Viết lại bài viết này thành blog post bằng Markdown (TIẾNG ANH).

QUY TẮC (bắt buộc):
- CHỈ dùng markdown: ## cho heading, - cho list, \`\`\` cho code block
- TUYỆT ĐỐI KHÔNG dùng HTML tags (<p>, <br>, <div>, <span>, <strong>, <h1>, <code>, etc.)
- Viết lại bằng lời của bạn, giữ nguyên nội dung và code blocks
- Kết thúc với: ${TRACKING_MARKER.trim()}
- Thêm dòng: *Originally published at ${article.url}*

Trả về JSON object (chỉ JSON, không kèm text khác):
{
  "summary": "Tóm tắt 1-2 câu",
  "tags": ["tag1", "tag2"],
  "body": "Nội dung markdown"
}

Tiêu đề: ${article.title}
Bài viết:
${body.slice(0, 8000)}`

    let result = ''
    try {
      result = await provider.call(prompt)
    } catch (err) {
      console.error(`    ✗ ${provider.name} failed: ${err.message}`)
      throw err
    }

    let data
    try {
      data = extractJson(result)
    } catch (err) {
      console.error(`    ✗ Failed to parse AI JSON response: ${err.message}`)
      throw err
    }

    const summary = data.summary || article.description || ''
    const tags = Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : article.tags
    let content = data.body || article.body

    // Nếu còn HTML tags, strip chúng sang markdown
    if (hasHtml(content)) {
      console.log(`    ⚠ Detected HTML in AI output, converting to markdown`)
      content = stripHtmlTags(content)
    }

    body = `export const meta = {
  slug: ${JSON.stringify(slug)},
  title: ${JSON.stringify(article.title)},
  date: ${JSON.stringify(article.date)},
  summary: ${JSON.stringify(summary)},
  tags: [${tags.map((t) => JSON.stringify(t)).join(', ')}],
}

${escapeMdxBraces(content || '')}`
  } else {
    body = rawFallback()
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
