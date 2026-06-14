export function countWords(text: string): number {
  const cleaned = text
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`~\[\]()>|]/g, '')
    .replace(/\${[^}]+}/g, '')
  return cleaned.split(/\s+/).filter(Boolean).length
}

const WORDS_PER_MINUTE = 200

export function estimateReadTime(wordCount: number): string {
  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
  return `${minutes} min`
}

export function computeReadTime(text: string): { wordCount: number; readTime: string } {
  const wordCount = countWords(text)
  return { wordCount, readTime: estimateReadTime(wordCount) }
}
