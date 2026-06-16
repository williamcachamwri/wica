import type { PostMeta } from '../data/posts'

interface ParsedPost {
  meta: PostMeta
  content: string
}

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const result: Record<string, unknown> = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value: string = line.slice(colonIdx + 1).trim()

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

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function estimateReadTime(wordCount: number): string {
  return `${Math.max(1, Math.round(wordCount / 200))} min`
}

export async function fetchPost(slug: string): Promise<ParsedPost> {
  const response = await fetch(`/posts/${slug}.md`)
  if (!response.ok) {
    throw new Error(`Post not found: ${slug}`)
  }
  const raw = await response.text()
  const frontmatter = parseFrontmatter(raw)
  const content = raw.replace(/^---[\s\S]*?\n---\n?/, '').trim()
  const wordCount = countWords(content)
  const readTime = estimateReadTime(wordCount)

  return {
    meta: {
      slug,
      title: (frontmatter.title as string) || slug,
      date: (frontmatter.date as string) || '',
      summary: (frontmatter.summary as string) || '',
      wordCount,
      readTime,
      tags: (frontmatter.tags as string[]) || [],
    },
    content,
  }
}
