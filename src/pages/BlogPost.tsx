import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { InlineLink } from '../components/InlineLink'
import { ToastContainer, showToast } from '../components/Toast'
import { allPosts } from '../data/allPosts'
import type { PostMeta } from '../data/allPosts'
import { fetchPost } from '../lib/posts'
import { getMdxPost } from '../lib/mdxPosts'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<{ meta: PostMeta; content: string } | null>(null)
  const [MdxComponent, setMdxComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return

    const mdx = getMdxPost(slug)
    if (mdx) {
      setMdxComponent(() => mdx.default)
      setPost({ meta: mdx.meta, content: '' })
      setError(false)
      return
    }

    fetchPost(slug)
      .then(setPost)
      .catch(() => setError(true))
  }, [slug])

  useEffect(() => {
    const article = document.querySelector('.prose')
    if (!article) return

    const pres = article.querySelectorAll('pre')
    const handlers: Array<() => void> = []

    pres.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return

      pre.style.position = 'relative'
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'code-copy-btn'
      button.setAttribute('aria-label', 'Copy code')
      button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`

      const handleClick = async () => {
        const code = pre.querySelector('code')?.textContent || pre.textContent || ''
        try {
          await navigator.clipboard.writeText(code)
          showToast('Copied to clipboard')
          button.classList.add('code-copy-btn--copied')
          button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
          setTimeout(() => {
            button.classList.remove('code-copy-btn--copied')
            button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
          }, 1800)
        } catch {
          showToast('Failed to copy')
        }
      }

      button.addEventListener('click', handleClick)
      pre.appendChild(button)
      handlers.push(() => button.removeEventListener('click', handleClick))
    })

    return () => {
      handlers.forEach((cleanup) => cleanup())
    }
  }, [post?.content, MdxComponent])

  if (error) {
    return (
      <div className="app-shell app-shell--in">
        <main className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="inline-link">‹ back to blog</Link>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="app-shell app-shell--in">
        <main className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">
          <p className="text-muted">Loading…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell app-shell--in">
      <div className="grain" aria-hidden="true" />
      <ToastContainer />

      <main id="main" className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-10">
          <Link to="/blog" className="inline-link text-sm mb-6 inline-block">
            ‹ back to blog
          </Link>
          <h1 className="name-title text-[clamp(1.75rem,5vw,2.5rem)] font-bold tracking-[-0.02em] leading-[1.15]">
            {post.meta.title}
          </h1>
          <time className="block mt-3 text-sm text-subtle font-mono">{formatDate(post.meta.date)}</time>
        </section>

        <article className="prose mb-16">
          {MdxComponent ? (
            <MdxComponent />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
            >
              {post.content}
            </ReactMarkdown>
          )}
        </article>

        <footer className="text-sm text-subtle text-center">
          <p>
            Built with React & Tailwind. Typeset in Inter, JetBrains Mono, and Caveat.{' '}
            <InlineLink href="#">View source</InlineLink>.
          </p>
        </footer>
      </main>
    </div>
  )
}

/* 4e2dc9db */
