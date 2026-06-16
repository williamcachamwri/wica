import { mdPosts } from '../lib/mdPosts'
import { mdxPosts } from '../lib/mdxPosts'
import type { PostMeta } from './posts'

export type { PostMeta }

function sortByDate(a: PostMeta, b: PostMeta): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

export const allPosts: PostMeta[] = [...mdPosts, ...mdxPosts].sort(sortByDate)
