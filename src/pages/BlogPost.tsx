import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { SEO } from '../components/SEO'
import { showToast } from '../components/Toast'
import { allPosts } from '../data/allPosts'
import type { PostMeta } from '../data/allPosts'
import { BlogInteractions } from '../components/BlogInteractions'
import { fetchPost } from '../lib/posts'
import { getMdxPost } from '../lib/mdxPosts'


function loadCss(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getPostUrl(slug: string) {
  return `${window.location.origin}/blog/${slug}`
}

async function copyLink(url: string, onDone?: () => void) {
  try {
    await navigator.clipboard.writeText(url)
    showToast('Link copied')
    onDone?.()
  } catch {
    showToast('Failed to copy')
  }
}

async function sharePost(url: string, title: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url })
    } catch {
      // user cancelled
    }
  } else {
    await copyLink(url)
  }
}

function getRelated(currentSlug: string, currentTags?: string[]): PostMeta[] {
  const others = allPosts.filter((p) => p.slug !== currentSlug)
  if (!currentTags || currentTags.length === 0) return others.slice(0, 2)
  const scored = others.map((p) => ({
    post: p,
    score: p.tags ? p.tags.filter((t) => currentTags.includes(t)).length : 0,
  }))
  scored.sort((a, b) => b.score - a.score || new Date(b.post.date).getTime() - new Date(a.post.date).getTime())
  return scored.slice(0, 2).map((s) => s.post)
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<{ meta: PostMeta; content: string } | null>(null)
  const [MdxComponent, setMdxComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const relatedPosts = useMemo(() => post?.meta ? getRelated(post.meta.slug, post.meta.tags) : [], [post?.meta])

  useEffect(() => {
    if (!slug) return

    const mdx = getMdxPost(slug)
    if (mdx) {
      setMdxComponent(() => mdx.default)
      setPost({ meta: mdx.meta, content: '' })
      setError(false)
      const content = mdx.meta.summary
      if (content?.includes('$')) loadCss('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css')
      if (content?.includes('```')) loadCss('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css')
      return
    }

    fetchPost(slug)
      .then((p) => {
        setPost(p)
        if (p.content.includes('$')) loadCss('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css')
        if (p.content.includes('```')) loadCss('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css')
      })
      .catch(() => setError(true))
  }, [slug])

  useEffect(() => {
    const article = document.querySelector('.prose')
    if (!article) return

    const pres = article.querySelectorAll('pre')
    const handlers: Array<() => void> = []

    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const ratio = docHeight > 0 ? scrollTop / docHeight : 0
      setProgress(Math.min(100, Math.max(0, ratio * 100)))
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    handlers.push(() => window.removeEventListener('scroll', updateProgress))

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
      {post && (
        <SEO
          title={post.meta.title}
          description={post.meta.summary}
          pathname={`/blog/${slug}`}
          type="article"
          publishedTime={post.meta.date}
        />
      )}
      <div className="grain" aria-hidden="true" />
      <div className="reading-progress" style={{ transform: `scaleX(${progress / 100})` }} aria-hidden="true" />

      <main id="main" className="max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-10">
          <Link to="/blog" className="inline-link text-sm mb-6 inline-block">
            ‹ back to blog
          </Link>
          <h1 className="name-title text-[clamp(1.75rem,5vw,2.5rem)] font-bold tracking-[-0.02em] leading-[1.15]">
            {post.meta.title}
          </h1>
          {post.meta.tags && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {post.meta.tags.map((t) => (
                <span key={t} className="blog-item__tag">{t}</span>
              ))}
            </div>
          )}
          <div className="mt-3 text-sm text-subtle font-mono">
            <time dateTime={post.meta.date}>{formatDate(post.meta.date)}</time>
            {(() => {
              const wc = post.meta.wordCount
              if (wc) {
                const rt = post.meta.readTime || `${Math.max(1, Math.round(wc / 200))} min`
                return <div className="mt-0.5 text-xs opacity-60">{wc} words · {rt} read</div>
              }
              return null
            })()}
          </div>

          <div className="blog-post__actions">
            <button
              type="button"
              className={`blog-post__action ${copied ? 'blog-post__action--copied' : ''}`}
              onClick={() => {
                if (copied) return
                copyLink(getPostUrl(slug || ''), () => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                })
              }}
              aria-label="Copy link"
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button
              type="button"
              className="blog-post__action"
              onClick={() => sharePost(getPostUrl(slug || ''), post.meta.title)}
              aria-label="Share post"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
          </div>
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

        {relatedPosts.length > 0 && (
          <section className="mb-16 related-posts">
            <h2 className="related-posts__title">Related posts</h2>
            <div className="related-posts__list">
              {relatedPosts.map((rp) => (
                <Link key={rp.slug} to={`/blog/${rp.slug}`} className="related-posts__card">
                  <h3 className="related-posts__card-title">{rp.title}</h3>
                  <p className="related-posts__card-summary">{rp.summary}</p>
                  <span className="related-posts__card-date">{formatDate(rp.date)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <BlogInteractions slug={slug || ''} title={post.meta.title} />

        <footer className="text-sm text-subtle text-center mt-16">
          <p>built with patience · styled with restraint</p>
        </footer>
      </main>
    </div>
  )
}
