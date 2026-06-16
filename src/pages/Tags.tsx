import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { SectionDivider } from '../components/SectionDivider'
import { Footer } from '../components/Footer'
import { allPosts } from '../data/allPosts'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function Tags() {
  const { tag } = useParams<{ tag: string }>()
  const decodedTag = decodeURIComponent(tag || '')

  const filtered = useMemo(
    () => allPosts.filter((p) => p.tags?.includes(decodedTag)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [decodedTag]
  )

  return (
    <div className="app-shell app-shell--in">
      <SEO
        title={`#${decodedTag}`}
        description={`Posts tagged with #${decodedTag}`}
        pathname={`/blog/tag/${encodeURIComponent(decodedTag)}`}
      />
      <div className="grain" aria-hidden="true" />

      <main id="main" className="max-w-[720px] mx-auto px-6 pt-16 md:pt-24 pb-20">
        <section className="mb-14">
          <Link to="/blog" className="inline-link text-sm mb-6 inline-block">
            ‹ back to blog
          </Link>
          <h1 className="name-title text-[clamp(2rem,6vw,3rem)] font-bold tracking-[-0.03em] leading-[1.1]">
            <span className="text-subtle">#</span>
            {decodedTag}
          </h1>
          <p className="mt-2 text-muted text-lg">
            {filtered.length} post{filtered.length !== 1 ? 's' : ''} tagged
          </p>
        </section>

        <section className="mb-14">
          <SectionDivider label="Posts" />
          <div className="blog-list">
            {filtered.length === 0 ? (
              <p className="text-muted text-sm">No posts found with this tag.</p>
            ) : (
              filtered.map((post) => (
                <article key={post.slug} className="blog-item group">
                  {post.tags && (
                    <div className="blog-item__tags">
                      {post.tags.map((t) => (
                        <Link
                          key={t}
                          to={`/blog/tag/${encodeURIComponent(t)}`}
                          className={`blog-item__tag ${t === decodedTag ? 'blog-item__tag--active' : ''}`}
                        >
                          {t}
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link to={`/blog/${post.slug}`} className="blog-item__link">
                    <div className="blog-item__header">
                      <h2 className="blog-item__title">{post.title}</h2>
                      <div className="blog-item__meta">
                        <time className="blog-item__date" dateTime={post.date}>
                          {formatDate(post.date)}
                        </time>
                        {post.readTime && (
                          <span className="blog-item__readtime">{post.readTime} read</span>
                        )}
                      </div>
                    </div>
                    <p className="blog-item__summary">{post.summary}</p>
                    <span className="blog-item__arrow" aria-hidden="true">
                      read article
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
