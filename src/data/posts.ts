export interface PostMeta {
  slug: string
  title: string
  date: string
  summary: string
}

export const posts: PostMeta[] = [
  {
    slug: 'markdown-test',
    title: 'Markdown & MDX Feature Test',
    date: '2024-12-01',
    summary: 'A full exercise of every supported Markdown feature on the blog.',
  },
  {
    slug: 'quiet-tools',
    title: 'The Quiet Joy of Small Tools',
    date: '2024-03-15',
    summary: 'Why I prefer building tiny, focused utilities over large platforms.',
  },
  {
    slug: 'design-systems',
    title: 'Designing Systems That Breathe',
    date: '2024-05-22',
    summary: 'Thoughts on whitespace, rhythm, and intentional constraints in UI design.',
  },
  {
    slug: 'slow-tech',
    title: 'Embracing Slow Tech',
    date: '2024-08-10',
    summary: 'On resisting the urge to optimize every second and building software that respects attention.',
  },
]
