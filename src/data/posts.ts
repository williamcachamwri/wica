export interface PostMeta {
  slug: string
  title: string
  date: string
  summary: string
  wordCount?: number
  readTime?: string
}

export const posts: PostMeta[] = [
  {
    slug: 'markdown-test',
    title: 'Markdown & MDX Feature Test',
    date: '2024-12-01',
    summary: 'A full exercise of every supported Markdown feature on the blog.',
    wordCount: 117,
    readTime: '1 min',
  },
  {
    slug: 'quiet-tools',
    title: 'The Quiet Joy of Small Tools',
    date: '2024-03-15',
    summary: 'Why I prefer building tiny, focused utilities over large platforms.',
    wordCount: 255,
    readTime: '2 min',
  },
  {
    slug: 'design-systems',
    title: 'Designing Systems That Breathe',
    date: '2024-05-22',
    summary: 'Thoughts on whitespace, rhythm, and intentional constraints in UI design.',
    wordCount: 194,
    readTime: '1 min',
  },
  {
    slug: 'slow-tech',
    title: 'Embracing Slow Tech',
    date: '2024-08-10',
    summary: 'On resisting the urge to optimize every second and building software that respects attention.',
    wordCount: 263,
    readTime: '2 min',
  },
]
