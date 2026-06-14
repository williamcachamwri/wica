import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { posts } from '../src/data/posts.ts'

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

// Include MDX posts similarly
// We need to import them - but since this is a build-time script,
// we can manually list or glob them
const mdxPosts = [
  {
    slug: 'mdx-test',
    title: 'MDX Interactive Test',
    date: '2024-12-15',
    summary: 'A demo of JSX components, LaTeX math, and Markdown living together.',
  },
]

const allPosts = [...posts, ...mdxPosts].sort((a, b) =>
  new Date(b.date).getTime() - new Date(a.date).getTime()
)

function buildRss() {
  const items = allPosts
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
