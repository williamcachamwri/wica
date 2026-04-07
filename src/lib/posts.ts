import type { PostMeta } from '../data/posts'

interface ParsedPost {
  meta: PostMeta
  content: string
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, content: raw }
  }

  const frontmatter: Record<string, string> = {}
  match[1].split('\n').forEach((line) => {
    const [key, ...rest] = line.split(':')
    if (key && rest.length) {
      frontmatter[key.trim()] = rest.join(':').trim()
    }
  })

  return { frontmatter, content: match[2].trim() }
}

export async function fetchPost(slug: string): Promise<ParsedPost> {
  const response = await fetch(`/posts/${slug}.md`)
  if (!response.ok) {
    throw new Error(`Post not found: ${slug}`)
  }
  const raw = await response.text()
  const { frontmatter, content } = parseFrontmatter(raw)

  return {
    meta: {
      slug,
      title: frontmatter.title || slug,
      date: frontmatter.date || '',
      summary: frontmatter.summary || '',
    },
    content,
  }
}
/* 0183b8f8 */
