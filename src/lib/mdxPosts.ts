import type { PostMeta } from '../data/posts'

interface MdxModule {
  default: React.ComponentType
  meta: PostMeta
}

const modules = import.meta.glob<MdxModule>('../posts/*.mdx', { eager: true })

export const mdxPosts: PostMeta[] = Object.values(modules).map((mod) => mod.meta)

export function getMdxPost(slug: string): MdxModule | undefined {
  return Object.values(modules).find((mod) => mod.meta.slug === slug)
}
/* b32588e2 */
