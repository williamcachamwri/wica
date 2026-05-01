import { mdxPosts } from '../lib/mdxPosts'
import { posts } from './posts'
import type { PostMeta } from './posts'

export type { PostMeta }

function sortByDate(a: PostMeta, b: PostMeta): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

export const allPosts: PostMeta[] = [...posts, ...mdxPosts].sort(sortByDate)
/* b37a652b */
